import { component$, $, useSignal, Resource, useVisibleTask$, NoSerialize, noSerialize } from '@builder.io/qwik';
import { DocumentHead, Form, Link, globalAction$, z, zod$, routeLoader$ } from '@builder.io/qwik-city';
import { useGetCurrentUser } from '../../layout';
import { useToaster } from '../../../components/toaster/toaster';
import { ACCESS_COOKIE_NAME, serverSideFetch, setTokensAsCookies } from '../../../shared/auth.service';
import { resizeImage } from '../../../utils/images';
import { DELETE_CONFIRMATION, DELETE_MODAL_ID, GenericModal } from '../../../components/dashboard/generic-modal/generic-modal';
import { capitalizeFirstLetter } from '../../../utils/strings';
import { formatRenewalDate } from '../../../lib/date-utils';
import * as Paddle from '@paddle/paddle-js';
import { RESUME_CONFIRMATION, RESUME_PLAN_MODAL_ID, useResumePlan } from './billing/use-resume-plan';
import { PLAN_MODAL_ID, PlanModal } from '../../../components/dashboard/plan-modal/plan-modal';

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];

const useDeleteUser = globalAction$(
  async (_, { fail, cookie, redirect }) => {
    const response: Response = await fetch(`${process.env.API_DOMAIN}/api/v1/auth/delete`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookie.get(ACCESS_COOKIE_NAME)?.value}`,
      },
    });

    const data = await response.json();

    if (response.status !== 200) {
      return fail(500, {
        message: data?.message,
      });
    }

    throw redirect(301, '/logout');
  },
  zod$({
    confirmation: z
      .string({
        required_error: `Please type ${DELETE_CONFIRMATION} to confirm.`,
      })
      .refine((val) => val === DELETE_CONFIRMATION, {
        message: `Please type ${DELETE_CONFIRMATION} to confirm.`,
      }),
  })
);

// Global action to handle profile updates
export const updateProfile = globalAction$(
  async ({ displayName, profilePicture }, { fail, cookie }) => {
    const body = {
      displayName,
      ...(profilePicture && { profilePicture }),
    };

    const response: Response = await fetch(`${process.env.API_DOMAIN}/api/v1/users/update`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cookie.get(ACCESS_COOKIE_NAME)?.value}`,
      },
      body: JSON.stringify(body),
    });

    const { accessToken, refreshToken } = await response.json();

    if (!response.ok || !accessToken || !refreshToken) {
      return fail(500, {
        message: 'Something went wrong. Please try again later.',
      });
    }

    setTokensAsCookies(accessToken, refreshToken, cookie);

    return {
      message: 'Profile updated successfully',
    };
  },
  zod$({
    displayName: z
      .string({
        required_error: 'Display name is required',
      })
      .min(3, {
        message: 'Display name must be at least 3 characters',
      })
      .max(25, {
        message: 'Display name must be less than 25 characters',
      }),
    profilePicture: z
      .string()
      .optional()
      .transform((value) => {
        // If value is not base 64 return undefined

        //eslint-disable-next-line
        if (!value || /^data:([A-Za-z-+\/]+);base64,(.+)$/.test(value) === false) {
          return undefined;
        }
        return value;
      })
      .refine(
        (data) => {
          if (!data) {
            return true;
          }

          // Extracting the MIME type and the Base64 string
          //eslint-disable-next-line
          const matches = data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
          if (!matches || matches.length !== 3) {
            return false; // Not a valid Base64 string
          }

          const mimeType = matches[1];
          const base64Data = matches[2];
          const buffer = Buffer.from(base64Data, 'base64');

          // Validate the file type
          if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
            return false;
          }

          // Validate the file size
          if (buffer.length > MAX_FILE_SIZE) {
            return false;
          }

          return true;
        },
        {
          message: "Invalid profile picture. Ensure it's a valid image and less than 1MB.",
        }
      ),
  })
);

export const useBillingInfo = routeLoader$(async ({ cookie }) => {
  const response = await serverSideFetch(`${process.env.API_DOMAIN}/api/v1/billing/info`, cookie);

  if (!response.ok) {
    throw new Error('Failed to fetch billing info');
  }

  return response.json();
});

export default component$(() => {
  const updateProfileAction = updateProfile();
  const user = useGetCurrentUser();
  const toaster = useToaster();
  const profilePicture = useSignal(user.value?.profilePicture);
  const displayName = useSignal(user.value?.name);
  const deleteAction = useDeleteUser();
  const resumePlanAction = useResumePlan();
  const billingInfo = useBillingInfo();
  const paddle = useSignal<NoSerialize<Paddle.Paddle | undefined>>(undefined);

  useVisibleTask$(async () => {
    const publicKey = import.meta.env.PUBLIC_PADDLE_KEY;
    if (!publicKey) {
      return;
    }

    paddle.value = noSerialize(
      await Paddle.initializePaddle({
        token: publicKey,
        environment: import.meta.env.DEV ? 'sandbox' : 'production',
      })
    );
  });

  const onUploadProfilePicture = $(async (event: Event) => {
    const file = (event.target as HTMLInputElement).files![0];

    if (!file || !/\.(jpe?g|png)$/i.test(file.name)) {
      toaster.add({
        title: 'Invalid file type',
        description: 'Only JPG, JPEG and PNG files are allowed',
        type: 'error',
      });
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toaster.add({
        title: 'File too large',
        description: 'The file you are trying to upload is too large. 1MB max.',
        type: 'error',
      });
      return;
    }

    try {
      const processedBlob = await resizeImage(file, 300, 300, 0.9);

      // Convert blob to base64 string
      const reader = new FileReader();
      reader.readAsDataURL(processedBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        profilePicture.value = base64data as string;
      };
    } catch (error) {
      toaster.add({
        title: 'Error processing image',
        description: 'Something went wrong with the image you are trying to upload. Please try again later.',
        type: 'error',
      });
    }
  });

  return (
    <>
      <PlanModal paddle={paddle.value} id={PLAN_MODAL_ID} />
      <GenericModal id={DELETE_MODAL_ID} confirmation="DELETE" operationType="delete" type="account" action={deleteAction} />
      <GenericModal
        id={RESUME_PLAN_MODAL_ID}
        confirmation={RESUME_CONFIRMATION}
        operationType="resume"
        type="subscription"
        action={resumePlanAction}
      />
      <div class="shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-xl w-full p-5 text-left">
        <Form
          action={updateProfileAction}
          onSubmitCompleted$={() => {
            if (updateProfileAction.value?.fieldErrors && Object.keys(updateProfileAction.value?.fieldErrors).length > 0) {
              return;
            }

            if (updateProfileAction.status !== 200) {
              toaster.add({
                title: 'Something went wrong',
                description: 'Please try again later',
                type: 'error',
              });
              return;
            }

            toaster.add({
              title: 'Profile updated',
              description: 'Your profile has been updated successfully',
              type: 'info',
            });
          }}
          class="block sm:grid grid-cols-3 gap-4"
        >
          <div>
            <div class="font-bold">Personal Information</div>
            <span class="text-sm text-gray-500">Update your personal information</span>
          </div>
          <div class="pt-4 sm:pt-0 col-span-2">
            <div class="flex gap-8 items-center">
              <div class="avatar">
                <div class="w-24 rounded">
                  <img src={profilePicture.value} width={844} height={844} />
                </div>
              </div>
              <div class="flex flex-col gap-2">
                <button
                  type="button"
                  class="btn btn-sm btn-natural"
                  onClick$={$(() => document.getElementById('profilePictureSelector')?.click())}
                >
                  Change avatar
                </button>
                <input
                  type="file"
                  id="profilePictureSelector"
                  name="profilePictureSelector"
                  accept=".jpg, .jpeg, .png"
                  style="display: none;"
                  onChange$={(event) => onUploadProfilePicture(event)}
                />
                <input type="hidden" name="profilePicture" value={profilePicture.value} />
                <span class="text-sm text-gray-500">JPG, JPEG or PNG. 1MB max.</span>
              </div>
            </div>
            {updateProfileAction.value?.fieldErrors?.profilePicture && (
              <span class="text-error text-sm">{updateProfileAction.value?.fieldErrors?.profilePicture}</span>
            )}
            <div class="pt-5">
              <label for="name" class="block text-sm mb-2 text-left">
                Display name
              </label>
              <input
                type="text"
                value={displayName.value}
                onInput$={(ev: InputEvent) => {
                  displayName.value = (ev.target as HTMLInputElement).value;
                }}
                id="displayName"
                name="displayName"
                class="py-3 px-4 w-full max-w-xs input input-bordered"
                required
              />
            </div>
            {updateProfileAction.value?.fieldErrors?.displayName && (
              <span class="text-error text-sm">{updateProfileAction.value?.fieldErrors?.displayName}</span>
            )}
            <div class="pt-5">
              <label for="email" class="block text-sm mb-2 text-left">
                Email address
              </label>
              <div class="flex gap-4 items-center">
                <input
                  type="email"
                  value={user.value?.email}
                  id="email"
                  name="email"
                  class="py-3 px-4 w-full max-w-xs input input-bordered"
                  disabled
                />
                {user.value?.verified === false ? (
                  <Link href="/register/verify" class="btn btn-warning">
                    Verify now
                  </Link>
                ) : (
                  <label class="text-sm text-gray-500">Email is verified</label>
                )}
              </div>
              <div class="pt-5">
                <button type="submit" class="btn btn-sm btn-primary">
                  {updateProfileAction.isRunning ? <span class="loading loading-spinner-small"></span> : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </Form>
        <div class="divider py-3"></div>
        <div class="block sm:grid grid-cols-3 gap-4">
          <div>
            <div class="font-bold">Billing</div>
            <span class="text-sm text-gray-500">Manage your billing information</span>
          </div>
          <div class="pt-4 sm:pt-0 col-span-2 w-full md:w-2/3 sm:w-full">
            <Resource
              value={billingInfo}
              onPending={() => <span>Loading...</span>}
              onResolved={(billingInfo) => {
                const { usage, limits, scheduledToBeCancelled } = billingInfo;
                const linkUsagePercentage = (usage.currentLinkCount / limits.linksCount) * 100;
                const clicksUsagePercentage = (usage.currentTrackedClicks / limits.trackedClicks) * 100;

                const getProgressBarClass = (percentage: number) => {
                  if (percentage >= 90) return 'bg-red-500';
                  if (percentage >= 70) return 'bg-yellow-500';
                  return 'bg-blue-500';
                };
                const pingColor = scheduledToBeCancelled ? 'bg-yellow-500' : 'bg-green-500';
                return (
                  <div>
                    <div class="flex justify-between items-center">
                      <div class="flex items-center">
                        <h2 class="text-lg font-bold mr-2">{capitalizeFirstLetter(billingInfo.plan)}</h2>
                        <div class="relative flex items-center">
                          <div class={`absolute inline-flex h-2 w-2 rounded-full ${pingColor}`}></div>
                          <div class={`absolute inline-flex h-2 w-2 rounded-full ${pingColor} opacity-75 animate-ping`}></div>
                        </div>
                      </div>
                      <div class="flex w-full justify-end gap-x-4">
                        {scheduledToBeCancelled ? (
                          <button
                            class="btn btn-sm btn-primary"
                            onClick$={$(() => {
                              (document.getElementById(RESUME_PLAN_MODAL_ID) as any).showModal();
                            })}
                          >
                            Resume subscription
                          </button>
                        ) : (
                          <button
                            class="btn btn-sm btn-primary"
                            onClick$={$(() => {
                              (document.getElementById(PLAN_MODAL_ID) as any).showModal();
                            })}
                          >
                            {billingInfo.plan === 'FREE' ? 'Upgrade plan' : 'Change plan'}
                          </button>
                        )}
                      </div>
                    </div>
                    {billingInfo.endDate || billingInfo.nextBillingAt ? (
                      <div class="mb-4 text-gray-500">
                        <span class="text-sm">
                          {scheduledToBeCancelled ? 'Scheduled to be cancelled' : 'Renews on'} on{' '}
                          {formatRenewalDate(new Date(billingInfo.nextBillingAt))}
                        </span>
                      </div>
                    ) : (
                      <div class="mb-4"></div>
                    )}
                    <div class="mb-4">
                      <div class="flex justify-between">
                        <span class="block text-sm font-semibold mb-1">Links Created</span>
                        <span class="text-sm font-bold">
                          {billingInfo.usage.currentLinkCount} / {billingInfo.limits.linksCount}{' '}
                          <span class="text-xs font-normal text-gray-400">({linkUsagePercentage.toPrecision(3)}%)</span>
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          class={`h-2.5 rounded-full ${getProgressBarClass(linkUsagePercentage)}`}
                          style={{ width: `${linkUsagePercentage > 100 ? 100 : linkUsagePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    <div class="mb-4">
                      <div class="flex justify-between">
                        <span class="block text-sm font-semibold mb-1">Tracked Clicks</span>
                        <span class="text-sm font-bold">
                          {billingInfo.usage.currentTrackedClicks} / {billingInfo.limits.trackedClicks}{' '}
                          <span class="text-xs font-normal text-gray-400">({clicksUsagePercentage.toPrecision(3)}%)</span>
                        </span>
                      </div>
                      <div class="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                        <div
                          class={`h-2.5 rounded-full ${getProgressBarClass(clicksUsagePercentage)}`}
                          style={{ width: `${clicksUsagePercentage > 100 ? 100 : clicksUsagePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>
        <div class="divider py-3"></div>

        <div class="block sm:grid grid-cols-3 gap-4">
          <div>
            <div class="font-bold">Delete account</div>
            <span class="text-sm text-gray-500">
              This action is not reversible, all information related to this account will be deleted permanently.
            </span>
          </div>
          <div class="pt-4 sm:pt-0 col-span-2">
            <button onClick$={() => (document.getElementById(DELETE_MODAL_ID) as any).showModal()} class="btn btn-sm btn-error">
              Delete account
            </button>
          </div>
        </div>
      </div>
    </>
  );
});

export const head: DocumentHead = {
  title: 'Reduced.to | Dashboard - Settings',
  meta: [
    {
      name: 'title',
      content: 'Reduced.to | Dashboard - My Settings',
    },
    {
      name: 'description',
      content: 'Reduced.to | Your settings page. update your profile, and more!',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://reduced.to/dashboard/settings',
    },
    {
      property: 'og:title',
      content: 'Reduced.to | Dashboard - My Settings',
    },
    {
      property: 'og:description',
      content: 'Reduced.to | Your settings page. update your profile, and more!',
    },
    {
      property: 'twitter:card',
      content: 'summary',
    },
    {
      property: 'twitter:title',
      content: 'Reduced.to | Dashboard - My Settings',
    },
    {
      property: 'twitter:description',
      content: 'Reduced.to | Your settings page. update your profile, and more!',
    },
  ],
};
