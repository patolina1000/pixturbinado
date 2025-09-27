(function () {
    'use strict';

    var DEFAULT_REDIRECT = '/back';
    var TRIGGER_DELAY = 250; // milliseconds before redirecting
    var backUrl = (typeof window !== 'undefined' && window.__BACK_REDIRECT_URL) || DEFAULT_REDIRECT;

    function resolveRedirectUrl() {
        try {
            if (!backUrl) {
                return DEFAULT_REDIRECT;
            }
            var url = backUrl;
            if (url.indexOf('http://') === 0 || url.indexOf('https://') === 0) {
                return url;
            }
            if (url.charAt(0) !== '/') {
                url = '/' + url;
            }
            return window.location.origin + url;
        } catch (e) {
            return DEFAULT_REDIRECT;
        }
    }

    var resolvedUrl = resolveRedirectUrl();

    function scheduleRedirect() {
        setTimeout(function () {
            try {
                window.location.replace(resolvedUrl);
            } catch (e) {
                window.location.href = resolvedUrl;
            }
        }, TRIGGER_DELAY);
    }

    function installHistoryTrap() {
        try {
            history.pushState({ redirectTrap: true }, document.title, window.location.href);
            window.addEventListener('popstate', function (event) {
                if (event && event.state && event.state.redirectTrap) {
                    scheduleRedirect();
                } else {
                    history.pushState({ redirectTrap: true }, document.title, window.location.href);
                    scheduleRedirect();
                }
            });
        } catch (e) {
            // history API might not be available; rely on visibility/pagehide hooks
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            scheduleRedirect();
        }
    });

    window.addEventListener('pagehide', function () {
        scheduleRedirect();
    });

    installHistoryTrap();
})();
