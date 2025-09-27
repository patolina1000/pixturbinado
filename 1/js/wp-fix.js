// Fix para resolver erro "wp is not defined"
if (typeof wp === 'undefined') {
    window.wp = {
        i18n: {
            setLocaleData: function(data) {
                // Função vazia para evitar erro
                console.log('wp.i18n.setLocaleData called with:', data);
            }
        }
    };
}

// Fix para resolver erro "a[c] is not a function" do Clarity
(function() {
    // Intercepta erros do Clarity e os silencia
    const originalError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        // Silencia erros específicos do Clarity
        if (message && message.includes('a[c] is not a function')) {
            console.warn('Clarity error silenced:', message);
            return true; // Previne que o erro apareça no console
        }
        
        // Chama o handler original se existir
        if (originalError) {
            return originalError.apply(this, arguments);
        }
        return false;
    };
})();
