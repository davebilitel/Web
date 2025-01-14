export const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

export const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent);
};

export const isAndroid = () => {
    return /Android/.test(navigator.userAgent);
}; 