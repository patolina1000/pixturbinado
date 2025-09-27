(function () {
    'use strict';

    // Evita carregar múltiplas vezes
    if (window.__BACK_REDIRECT_LOADED) {
        return;
    }
    window.__BACK_REDIRECT_LOADED = true;

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
    console.log('PixTurbinado Back Redirect carregado. URL de destino:', resolvedUrl);

    function scheduleRedirect() {
        console.log('PixTurbinado: Redirecionando para', resolvedUrl);
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
            console.log('PixTurbinado: History trap instalado');
            window.addEventListener('popstate', function (event) {
                console.log('PixTurbinado: Popstate detectado', event);
                if (event && event.state && event.state.redirectTrap) {
                    scheduleRedirect();
                } else {
                    history.pushState({ redirectTrap: true }, document.title, window.location.href);
                    scheduleRedirect();
                }
            });
        } catch (e) {
            console.log('PixTurbinado: Erro ao instalar history trap:', e);
        }
    }

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            console.log('PixTurbinado: Página ficou oculta');
            scheduleRedirect();
        }
    });

    window.addEventListener('pagehide', function () {
        console.log('PixTurbinado: Pagehide detectado');
        scheduleRedirect();
    });

    installHistoryTrap();
})();
