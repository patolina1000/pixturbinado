(function () {
    'use strict';

    // Evita carregar múltiplas vezes
    if (window.__BACK_REDIRECT_LOADED) {
        return;
    }
    window.__BACK_REDIRECT_LOADED = true;

    var DEFAULT_REDIRECT = '/back';
    var TRIGGER_DELAY = 100; // reduzido para resposta mais rápida
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
            return window.location.origin + DEFAULT_REDIRECT;
        }
    }

    var resolvedUrl = resolveRedirectUrl();
    console.log('PixTurbinado Back Redirect carregado. URL de destino:', resolvedUrl);

    function forceRedirect() {
        console.log('PixTurbinado: FORÇANDO redirecionamento para', resolvedUrl);
        try {
            window.location.replace(resolvedUrl);
        } catch (e) {
            try {
                window.location.href = resolvedUrl;
            } catch (e2) {
                window.open(resolvedUrl, '_self');
            }
        }
    }

    function scheduleRedirect() {
        console.log('PixTurbinado: Agendando redirecionamento para', resolvedUrl);
        setTimeout(forceRedirect, TRIGGER_DELAY);
    }

    // Instala múltiplas camadas de proteção
    function installHistoryTrap() {
        try {
            // Adiciona múltiplas entradas no histórico
            history.pushState({ redirectTrap: true }, '', location.href);
            history.pushState({ redirectTrap: true }, '', location.href);
            history.pushState({ redirectTrap: true }, '', location.href);
            
            console.log('PixTurbinado: History trap instalado com múltiplas camadas');
            
            // Listener principal para popstate
            window.addEventListener('popstate', function (event) {
                console.log('PixTurbinado: Popstate detectado - REDIRECIONANDO IMEDIATAMENTE', event);
                event.preventDefault();
                event.stopPropagation();
                forceRedirect();
                return false;
            }, true);

            // Listener adicional sem capture
            window.addEventListener('popstate', function (event) {
                console.log('PixTurbinado: Popstate secundário detectado');
                forceRedirect();
            });

        } catch (e) {
            console.log('PixTurbinado: Erro ao instalar history trap:', e);
        }
    }

    // Detecta quando a página fica oculta (usuário mudou de aba)
    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            console.log('PixTurbinado: Página ficou oculta - redirecionando');
            scheduleRedirect();
        }
    });

    // Detecta quando a página está sendo fechada/saindo
    window.addEventListener('pagehide', function (event) {
        console.log('PixTurbinado: Pagehide detectado - redirecionando');
        scheduleRedirect();
    });

    // Detecta tentativas de navegação
    window.addEventListener('beforeunload', function (event) {
        console.log('PixTurbinado: Beforeunload detectado');
        // Não podemos redirecionar aqui, mas podemos logar
    });

    // Instala o trap imediatamente
    installHistoryTrap();

    // Força uma verificação periódica
    setInterval(function() {
        if (history.length < 3) {
            console.log('PixTurbinado: Reinstalando history trap');
            installHistoryTrap();
        }
    }, 1000);

})();
