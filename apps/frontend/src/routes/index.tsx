import { component$, createContextId, useContext, useContextProvider, useSignal, useStore, useStylesScoped$ } from '@builder.io/qwik';
import { DocumentHead } from '@builder.io/qwik-city';
import animations from '../assets/css/animations.css?inline';
import { handleShareOnTwitter } from '../components/home-buttons/actions';
import { TwitterButton } from '../components/home-buttons/twitter-button/twitter-button';
import { Loader } from '../components/loader/loader';
import { generateQRCode } from '../components/qr-code/handleQRCode';
import { QRCode } from '../components/qr-code/qr-code';
import { handleShortener } from '../components/shortener-input/handleShortener';
import { ShortenerInput } from '../components/shortener-input/shortener-input';
import { Tooltip } from '../components/tooltip/tooltip';
import { Waves } from '../components/waves/waves';
import { copyToClipboard, openUrl } from '../utils';
import styles from './index.css?inline';
import { TIME_FRAME_DIR } from '../components/shortener-input/constants';
import { GlobalStore } from '../context';
export const InputContext = createContextId<Store>('input');

export interface Store {
  inputValue: string;
  reducedUrl: string;
  loading: boolean;
  showResult: boolean;
  showQRCode: boolean;
  urlError: string;
  ttl: number;
}

export const clearValues = (state: Store) => {
  state.reducedUrl = '';
  state.showResult = false;
  state.showQRCode = false;
  state.urlError = '';
};

export default component$(() => {
  useStylesScoped$(animations);
  useStylesScoped$(styles);

  const tooltipCopyRef = useSignal(false);
  const globalStore = useContext(GlobalStore);
  const state = useStore<Store>({
    inputValue: '',
    reducedUrl: '',
    loading: false,
    showResult: false,
    showQRCode: false,
    urlError: '',
    ttl: TIME_FRAME_DIR.ONE_WEEK.value,
  });

  useContextProvider(InputContext, state);

  return (
    <div class="overflow-x-hidden overflow-y-auto md:overflow-hidden">
      <div class="flex flex-col justify-start h-[calc(100vh-64px)]">
        <div class="mx-auto container grid grid-cols-12 flex-1">
          <div class="col-start-2 col-end-12 md:col-start-3 md:col-end-11">
            <div class="flex flex-col">
              <article class="prose mx-auto max-w-4xl pb-16">
                <div class="mx-auto">
                  <svg class="mx-auto my-8" width="410" height="73" viewBox="0 0 2930 465" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      fill-rule="evenodd"
                      clip-rule="evenodd"
                      d="M66.5925 164.482V128.326H4.37036V460.222H66.5925V294.296C66.5258 280.659 69.1626 267.144 74.3506 254.532C79.5385 241.92 87.1747 230.461 96.8178 220.818C106.461 211.175 117.92 203.539 130.532 198.351C143.144 193.163 156.659 190.526 170.296 190.593C183.697 190.742 196.957 193.353 209.415 198.296L228.97 139.037C210.236 131.897 190.344 128.28 170.296 128.37C132.581 128.027 95.9193 140.809 66.5925 164.526V164.482ZM476.422 177.222C461.286 161.512 443.093 149.07 422.965 140.661C402.836 132.253 381.198 128.057 359.385 128.333C337.572 128.057 315.934 132.252 295.804 140.66C275.675 149.068 257.483 161.512 242.348 177.222C226.638 192.357 214.195 210.55 205.787 230.679C197.379 250.808 193.183 272.446 193.459 294.259C193.194 316.122 197.304 337.818 205.549 358.069C213.793 378.32 226.005 396.717 241.466 412.178C256.927 427.639 275.324 439.851 295.575 448.095C315.826 456.34 337.522 460.45 359.385 460.185C387.894 460.026 416.128 454.601 442.666 444.185C467.663 435.681 489.338 419.502 504.599 397.955L451.266 366.541C427.948 387.489 397.33 397.96 359.414 397.955C336.07 398.725 313.037 392.425 293.333 379.881C284.178 373.531 276.391 365.408 270.435 355.992C264.479 346.576 260.474 336.059 258.659 325.067H522.362C524.252 314.902 525.243 304.59 525.325 294.252C525.598 272.439 521.4 250.802 512.989 230.674C504.578 210.547 492.133 192.355 476.422 177.222ZM297.733 210.711C315.617 197.619 337.206 190.562 359.37 190.562C381.534 190.562 403.123 197.619 421.007 210.711C439.01 223.357 452.178 241.749 458.348 262.867H260.392C266.555 241.745 279.724 223.351 297.733 210.711ZM697.184 128.326C675.342 127.981 653.661 132.116 633.478 140.475C613.295 148.834 595.039 161.239 579.836 176.926C564.149 192.129 551.743 210.385 543.385 230.567C535.026 250.75 530.891 272.431 531.236 294.274C530.894 316.112 535.029 337.788 543.388 357.966C551.747 378.143 564.151 396.394 579.836 411.592C608.706 440.535 647.27 457.763 688.091 459.951C728.912 462.14 769.097 449.135 800.895 423.444V460.192H863.118V3.86685H800.895V164.482C771.567 140.767 734.899 127.986 697.184 128.326ZM623.984 367.466C614.314 357.888 606.638 346.487 601.399 333.925C596.161 321.362 593.463 307.885 593.463 294.274C593.463 280.663 596.161 267.186 601.399 254.623C606.638 242.061 614.314 230.66 623.984 221.081C638.433 206.49 656.898 196.53 677.027 192.47C697.156 188.41 718.038 190.435 737.012 198.285C755.987 206.135 772.195 219.456 783.572 236.551C794.949 253.645 800.979 273.74 800.895 294.274C800.936 314.789 794.88 334.854 783.496 351.92C772.112 368.987 755.913 382.286 736.957 390.129C718 397.972 697.14 400.005 677.026 395.97C656.911 391.935 638.45 382.014 623.984 367.466ZM1105.52 370.429C1097.04 379.302 1086.82 386.329 1075.5 391.071C1064.18 395.812 1052 398.166 1039.73 397.985C1014.93 397.87 991.181 387.967 973.645 370.43C956.11 352.893 946.208 329.141 946.095 304.341V128.326H883.873V304.348C883.543 324.865 887.421 345.233 895.269 364.193C903.117 383.153 914.768 400.303 929.503 414.585C943.925 429.051 961.059 440.528 979.925 448.359C998.791 456.19 1019.02 460.222 1039.44 460.222C1059.87 460.222 1080.1 456.19 1098.96 448.359C1117.83 440.528 1134.96 429.051 1149.38 414.585C1164.12 400.303 1175.77 383.152 1183.62 364.193C1191.47 345.233 1195.35 324.866 1195.02 304.348V128.326H1132.8V304.348C1132.97 316.637 1130.64 328.832 1125.95 340.192C1121.26 351.552 1114.31 361.84 1105.52 370.429ZM1287.47 367.763C1277.67 358.229 1269.94 346.79 1264.74 334.15C1259.54 321.51 1256.99 307.939 1257.24 294.274C1257.17 280.637 1259.81 267.122 1265 254.511C1270.18 241.899 1277.82 230.441 1287.46 220.798C1297.11 211.155 1308.56 203.519 1321.18 198.33C1333.79 193.142 1347.3 190.505 1360.94 190.57C1380.44 190.388 1399.58 195.841 1416.06 206.274C1432.34 216.406 1445.48 230.876 1453.99 248.059L1509.1 220.207C1495.51 192.821 1474.58 169.743 1448.65 153.541C1423.54 137.872 1394.69 129.209 1365.1 128.45C1335.52 127.691 1306.26 134.864 1280.38 149.224C1254.5 163.584 1232.93 184.608 1217.92 210.115C1202.9 235.623 1194.99 264.683 1194.99 294.281C1194.65 316.119 1198.79 337.794 1207.15 357.971C1215.51 378.147 1227.92 396.396 1243.61 411.592C1270.1 438.114 1304.8 454.868 1342.05 459.12C1379.29 463.371 1416.88 454.868 1448.67 435C1474.6 418.803 1495.53 395.723 1509.12 368.333L1454.01 340.474C1445.5 357.661 1432.36 372.132 1416.07 382.259C1399.6 392.696 1380.46 398.15 1360.95 397.963C1347.29 398.217 1333.72 395.669 1321.08 390.475C1308.44 385.28 1297 377.551 1287.47 367.763ZM1792.12 177.222C1776.81 161.737 1758.59 149.444 1738.5 141.053C1718.41 132.663 1696.85 128.342 1675.08 128.342C1653.31 128.342 1631.75 132.663 1611.66 141.053C1591.57 149.444 1573.35 161.737 1558.04 177.222C1542.33 192.358 1529.89 210.551 1521.48 230.68C1513.07 250.809 1508.88 272.447 1509.15 294.259C1508.89 316.122 1513 337.818 1521.24 358.069C1529.49 378.32 1541.7 396.717 1557.16 412.178C1572.62 427.639 1591.02 439.851 1611.27 448.095C1631.52 456.34 1653.22 460.45 1675.08 460.185C1703.59 460.024 1731.82 454.599 1758.35 444.185C1783.35 435.68 1805.02 419.502 1820.29 397.955L1766.95 366.541C1743.64 387.489 1713.02 397.96 1675.1 397.955C1651.76 398.724 1628.72 392.424 1609.02 379.881C1599.87 373.531 1592.08 365.407 1586.12 355.991C1580.17 346.575 1576.16 336.059 1574.35 325.067H1838.09C1839.98 314.902 1840.97 304.59 1841.05 294.252C1841.32 272.437 1837.12 250.798 1828.7 230.67C1820.29 210.542 1807.83 192.352 1792.12 177.222ZM1613.43 210.711C1631.31 197.619 1652.9 190.562 1675.06 190.562C1697.23 190.562 1718.82 197.619 1736.7 210.711C1754.71 223.356 1767.87 241.748 1774.04 262.867H1576.09C1582.25 241.746 1595.42 223.352 1613.43 210.711ZM2012.88 128.333C1991.04 127.989 1969.36 132.124 1949.17 140.482C1928.99 148.841 1910.73 161.246 1895.53 176.933C1879.84 192.136 1867.44 210.392 1859.08 230.575C1850.72 250.758 1846.59 272.439 1846.93 294.281C1846.59 316.118 1850.73 337.793 1859.09 357.969C1867.44 378.145 1879.85 396.395 1895.53 411.592C1924.4 440.536 1962.97 457.764 2003.79 459.952C2044.61 462.141 2084.8 449.135 2116.6 423.444V460.192H2178.82V3.86685H2116.6V164.482C2087.27 140.767 2050.61 127.986 2012.89 128.326L2012.88 128.333ZM1939.7 367.466C1930.03 357.888 1922.35 346.488 1917.11 333.925C1911.88 321.362 1909.18 307.886 1909.18 294.274C1909.18 280.662 1911.88 267.186 1917.11 254.623C1922.35 242.06 1930.03 230.66 1939.7 221.081C1954.15 206.49 1972.61 196.53 1992.74 192.47C2012.87 188.41 2033.75 190.435 2052.73 198.285C2071.7 206.135 2087.91 219.456 2099.29 236.551C2110.67 253.645 2116.7 273.74 2116.61 294.274C2116.65 314.789 2110.6 334.854 2099.21 351.92C2087.83 368.987 2071.63 382.286 2052.67 390.129C2033.72 397.972 2012.86 400.005 1992.74 395.97C1972.63 391.935 1954.17 382.014 1939.7 367.466ZM2276.63 385.541C2267.96 385.518 2259.56 388.502 2252.85 393.983C2246.14 399.464 2241.54 407.103 2239.83 415.597C2238.13 424.091 2239.42 432.914 2243.49 440.561C2247.56 448.208 2254.16 454.206 2262.16 457.532C2270.16 460.858 2279.07 461.305 2287.36 458.798C2295.65 456.292 2302.82 450.985 2307.64 443.785C2312.46 436.585 2314.63 427.936 2313.78 419.314C2312.94 410.691 2309.12 402.63 2303 396.503C2299.58 392.972 2295.48 390.178 2290.94 388.294C2286.4 386.41 2281.53 385.475 2276.61 385.548L2276.63 385.541ZM2584.21 379.615C2578.06 383.665 2571.38 386.854 2564.36 389.096C2555.32 392.285 2545.8 393.888 2536.21 393.837H2530.29C2525.3 393.181 2520.42 391.886 2515.77 389.985C2509.77 387.686 2504.02 384.809 2498.58 381.392C2492.18 377.06 2487.15 370.997 2484.06 363.911C2479.96 355.106 2477.93 345.476 2478.14 335.763V190.556H2590.15V128.333H2478.11V45.3557H2415.89V128.319H2374.4V190.541H2415.89V356.466C2415.82 370.103 2418.46 383.618 2423.65 396.23C2428.83 408.841 2436.47 420.3 2446.11 429.943C2455.76 439.585 2467.21 447.222 2479.83 452.41C2492.44 457.598 2505.95 460.236 2519.59 460.17C2535.65 460.365 2551.64 458.066 2567 453.355C2576.42 450.865 2585.48 447.18 2593.96 442.392C2596.99 440.232 2599.87 437.855 2602.56 435.281L2590.11 374.237L2584.21 379.615ZM2593.69 294.274C2593.35 316.111 2597.48 337.787 2605.84 357.965C2614.19 378.142 2626.6 396.394 2642.28 411.592C2673.4 442.71 2715.61 460.19 2759.63 460.19C2803.64 460.19 2845.85 442.71 2876.97 411.592C2892.66 396.389 2905.06 378.133 2913.42 357.95C2921.78 337.767 2925.91 316.086 2925.57 294.244C2925.91 272.403 2921.78 250.722 2913.42 230.54C2905.06 210.357 2892.66 192.101 2876.97 176.896C2845.85 145.779 2803.64 128.298 2759.63 128.298C2715.61 128.298 2673.4 145.779 2642.28 176.896C2626.59 192.102 2614.18 210.362 2605.82 230.551C2597.46 250.739 2593.33 272.426 2593.68 294.274H2593.69ZM2655.92 294.274C2655.92 266.77 2666.84 240.393 2686.29 220.944C2705.74 201.496 2732.12 190.57 2759.62 190.57C2787.12 190.57 2813.5 201.496 2832.95 220.944C2852.4 240.393 2863.32 266.77 2863.32 294.274C2863.32 321.779 2852.4 348.157 2832.95 367.606C2813.5 387.055 2787.12 397.981 2759.62 397.981C2732.11 397.981 2705.73 387.055 2686.28 367.606C2666.83 348.157 2655.91 321.779 2655.91 294.274H2655.92Z"
                      fill={globalStore.theme === 'light' ? 'black' : 'white'}
                      stroke={globalStore.theme === 'light' ? 'white' : 'black'}
                      stroke-width="7.4074"
                      stroke-linejoin="round"
                    />
                  </svg>
                </div>
                <p>
                  Add your very long <b>URL</b> in the input below and click on the button to make it shorter
                </p>
              </article>
              <ShortenerInput
                onKeyUp$={(event) => {
                  if (event.key.toLowerCase() === 'enter' && state.inputValue.length > 0) {
                    clearValues(state);
                    handleShortener(state);
                  }
                }}
                onInput$={(event) => {
                  state.inputValue = (event.target as HTMLInputElement).value;
                }}
                onSubmit$={() => {
                  clearValues(state);
                  handleShortener(state);
                }}
              />
              <Loader visible={state.loading} />
              <div id="result" class={state.showResult ? '' : 'hidden'}>
                <p id="error" class="fade-in">
                  {state.urlError}
                </p>
                <span id="text" class="fade-in cursor-pointer block" onClick$={() => copyToClipboard(state.reducedUrl)}>
                  {state.reducedUrl}
                </span>
                <div
                  id="action"
                  class={`${
                    state.reducedUrl ? '' : 'hidden'
                  } btn-group p-4 relative [&>:first-child>.btn]:rounded-l-lg [&>:last-child>.btn]:rounded-r-lg [&>*>.btn]:rounded-none`}
                >
                  <button
                    type="button"
                    title="Copy"
                    class="btn relative"
                    onClick$={() => {
                      copyToClipboard(state.reducedUrl);
                      tooltipCopyRef.value = true;
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75"
                      />
                    </svg>
                    <Tooltip label="Copied!" position="bottom" open={tooltipCopyRef}></Tooltip>
                  </button>
                  <button type="button" title="Open in new tab" class="btn" onClick$={() => openUrl(state.reducedUrl)}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                      />
                    </svg>
                  </button>
                  <button
                    type="button"
                    title="QR Code"
                    class="btn"
                    onClick$={() => {
                      generateQRCode(state.reducedUrl, 150);
                      state.showQRCode = true;
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width={1.5}
                      stroke="currentColor"
                      class="w-6 h-6"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 013.75 9.375v-4.5zM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 01-1.125-1.125v-4.5zM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0113.5 9.375v-4.5z"
                      />
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M6.75 6.75h.75v.75h-.75v-.75zM6.75 16.5h.75v.75h-.75v-.75zM16.5 6.75h.75v.75h-.75v-.75zM13.5 13.5h.75v.75h-.75v-.75zM13.5 19.5h.75v.75h-.75v-.75zM19.5 13.5h.75v.75h-.75v-.75zM19.5 19.5h.75v.75h-.75v-.75zM16.5 16.5h.75v.75h-.75v-.75z"
                      />
                    </svg>
                  </button>
                  <TwitterButton handleClick$={() => handleShareOnTwitter(state.reducedUrl)} />
                </div>
              </div>
              <div id="qrcode" class={`${state.showQRCode ? '' : 'hidden'} mx-auto`}>
                <QRCode showDownload />
              </div>
            </div>
          </div>
        </div>
        <Waves />
      </div>
    </div>
  );
});

export const head: DocumentHead = {
  title: 'The FREE Open-Source URL Shortener | Reduced.to',
  meta: [
    {
      name: 'title',
      content: 'Reduced.to | The FREE Open-Source URL Shortener',
    },
    {
      name: 'description',
      content:
        'Reduced.to is the FREE, Modern, and Open-Source URL Shortener. Convert those ugly and long URLs into short, easy to manage links and QR-Codes.',
    },
    {
      property: 'og:type',
      content: 'website',
    },
    {
      property: 'og:url',
      content: 'https://reduced.to',
    },
    {
      property: 'og:title',
      content: 'Reduced.to | The FREE Open-Source URL Shortener',
    },
    {
      property: 'og:description',
      content:
        'Reduced.to is the FREE, Modern, and Open-Source URL Shortener. Convert those ugly and long URLs into short, easy to manage links and QR-Codes.',
    },
    {
      property: 'twitter:card',
      content: 'summary',
    },
    {
      property: 'twitter:title',
      content: 'Reduced.to | The FREE Open-Source URL Shortener',
    },
    {
      property: 'twitter:description',
      content:
        'Reduced.to is the FREE, Modern, and Open-Source URL Shortener. Convert those ugly and long URLs into short, easy to manage links and QR-Codes.',
    },
  ],
};
