// Fix para resolver erros comuns no Render - PixTurbinado
(function() {
    'use strict';
    
    // Fix para resolver erro "wp is not defined"
    if (typeof window.wp === 'undefined') {
        window.wp = {
            i18n: {
                setLocaleData: function(data) {
                    // Função vazia para evitar erro
                    console.log('wp.i18n.setLocaleData called with:', data);
                    return true;
                }
            }
        };
    }

    // Fix para resolver erro "a[c] is not a function" do Clarity
    const originalError = window.onerror;
    const originalUnhandledRejection = window.onunhandledrejection;
    
    window.onerror = function(message, source, lineno, colno, error) {
        // Silencia erros específicos do Clarity e outros scripts problemáticos
        if (message && (
            message.includes('a[c] is not a function') ||
            message.includes('rc0ucdrmun') ||
            message.includes('clarity') ||
            message.includes('Script error')
        )) {
            console.warn('Script error silenced:', message);
            return true; // Previne que o erro apareça no console
        }
        
        // Chama o handler original se existir
        if (originalError) {
            return originalError.apply(this, arguments);
        }
        return false;
    };
    
    // Intercepta erros de promise rejeitadas
    window.onunhandledrejection = function(event) {
        if (event.reason && event.reason.message && (
            event.reason.message.includes('clarity') ||
            event.reason.message.includes('rc0ucdrmun')
        )) {
            console.warn('Promise rejection silenced:', event.reason);
            event.preventDefault();
            return;
        }
        
        if (originalUnhandledRejection) {
            return originalUnhandledRejection.apply(this, arguments);
        }
    };
    
    // Aguarda o DOM estar pronto para aplicar fixes adicionais
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyDOMFixes);
    } else {
        applyDOMFixes();
    }
    
    function applyDOMFixes() {
        // Fix para scripts que podem não carregar
        setTimeout(function() {
            // Verifica se jQuery carregou, se não, cria um stub básico
            if (typeof window.$ === 'undefined' && typeof window.jQuery === 'undefined') {
                window.$ = window.jQuery = function() {
                    return {
                        ready: function(fn) { if (typeof fn === 'function') fn(); },
                        on: function() { return this; },
                        off: function() { return this; },
                        trigger: function() { return this; },
                        each: function() { return this; },
                        find: function() { return this; },
                        length: 0
                    };
                };
            }
        }, 100);
    }
    
    console.log('PixTurbinado error fixes loaded successfully');
})();
