/**
 * Lingoung Bank Payment Gateway - Drop-in Client SDK
 * Lightweight, zero-dependency embedded checkout widget & modal
 * https://lingoung-bank.vercel.app
 */
(function(window, document) {
  'use strict';

  var DEFAULT_HOST = (typeof window !== 'undefined' && window.location && window.location.origin) 
    ? window.location.origin 
    : 'https://lingoung-bank.vercel.app';

  var LingoungPay = {
    version: '2.0.0',
    host: DEFAULT_HOST,

    setHost: function(hostUrl) {
      if (hostUrl) this.host = hostUrl.replace(/\/+$/, '');
    },

    /**
     * Initialize a checkout session and present modal, popup, or redirect
     */
    checkout: function(options) {
      options = options || {};
      var apiKey = options.apiKey;
      if (!apiKey) {
        var err = new Error('LingoungPay: apiKey is required');
        if (options.onError) options.onError(err);
        else console.error(err);
        return;
      }

      var self = this;
      var endpoint = this.host + '/api/payment-gateway/payments';

      var payload = {
        amount: Number(options.amount || 0),
        currency: (options.currency || 'USD').toUpperCase(),
        description: options.description || 'Payment via Lingoung Bank',
        customerName: options.customerName || undefined,
        customerEmail: options.customerEmail || undefined,
        orderId: options.orderId || ('ORD-' + Date.now()),
        successUrl: options.successUrl || undefined,
        cancelUrl: options.cancelUrl || undefined,
      };

      fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey.trim(),
        },
        body: JSON.stringify(payload)
      })
      .then(function(res) {
        if (!res.ok) {
          return res.json().then(function(data) {
            throw new Error(data.error || 'Failed to initialize payment');
          });
        }
        return res.json();
      })
      .then(function(data) {
        var paymentId = data.paymentId;
        var paymentUrl = data.paymentUrl || (self.host + '/payment/' + paymentId);
        var mode = options.mode || 'modal';

        if (mode === 'redirect') {
          window.location.href = paymentUrl;
        } else if (mode === 'popup') {
          self._openPopup(paymentUrl, paymentId, options);
        } else {
          self._openModal(paymentUrl, paymentId, options);
        }
      })
      .catch(function(err) {
        if (options.onError) options.onError(err);
        else alert('Payment Error: ' + err.message);
      });
    },

    _openModal: function(url, paymentId, options) {
      this._closeModal();

      var embedUrl = url + (url.indexOf('?') > -1 ? '&' : '?') + 'embedded=true';

      var overlay = document.createElement('div');
      overlay.id = 'lingoung-checkout-modal';
      overlay.setAttribute('style', [
        'position: fixed',
        'inset: 0',
        'z-index: 999999',
        'background: rgba(5, 7, 11, 0.88)',
        'backdrop-filter: blur(14px)',
        '-webkit-backdrop-filter: blur(14px)',
        'display: flex',
        'align-items: center',
        'justify-content: center',
        'padding: 16px',
        'opacity: 0',
        'transition: opacity 0.25s ease',
        'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      ].join(';'));

      var container = document.createElement('div');
      container.setAttribute('style', [
        'position: relative',
        'width: 100%',
        'max-width: 490px',
        'height: 650px',
        'max-height: 94vh',
        'background: #090d16',
        'border: 1px solid rgba(255, 255, 255, 0.15)',
        'border-radius: 24px',
        'box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 45px rgba(212, 255, 0, 0.15)',
        'overflow: hidden',
        'display: flex',
        'flex-direction: column',
        'transform: scale(0.96) translateY(12px)',
        'transition: transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)'
      ].join(';'));

      var header = document.createElement('div');
      header.setAttribute('style', [
        'display: flex',
        'align-items: center',
        'justify-content: space-between',
        'padding: 14px 20px',
        'background: rgba(255, 255, 255, 0.03)',
        'border-bottom: 1px solid rgba(255, 255, 255, 0.08)'
      ].join(';'));

      header.innerHTML = [
        '<div style="display:flex;align-items:center;gap:8px;">',
        '  <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#d4ff00;box-shadow:0 0 8px #d4ff00;"></span>',
        '  <span style="font-size:12px;font-weight:800;letter-spacing:1px;color:#fff;text-transform:uppercase;">Lingoung Secure Checkout</span>',
        '</div>',
        '<button id="lingoung-modal-close" type="button" style="background:rgba(255,255,255,0.08);border:none;color:#94a3b8;width:28px;height:28px;border-radius:50%;cursor:pointer;font-size:18px;line-height:1;display:flex;align-items:center;justify-content:center;transition:background 0.2s;">&times;</button>'
      ].join('');

      var iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.setAttribute('style', 'width:100%;flex:1;border:none;background:#05070B;');
      iframe.setAttribute('allow', 'payment');

      container.appendChild(header);
      container.appendChild(iframe);
      overlay.appendChild(container);
      document.body.appendChild(overlay);

      requestAnimationFrame(function() {
        overlay.style.opacity = '1';
        container.style.transform = 'scale(1) translateY(0)';
      });

      var selfRef = this;
      function handleClose() {
        selfRef._closeModal();
        if (options.onCancel) options.onCancel();
      }

      var closeBtn = header.querySelector('#lingoung-modal-close');
      if (closeBtn) closeBtn.onclick = handleClose;

      overlay.onclick = function(e) {
        if (e.target === overlay) handleClose();
      };

      var messageHandler = function(event) {
        if (!event.data) return;
        if (event.data.type === 'lingoung.payment.success' || event.data.event === 'payment.completed') {
          window.removeEventListener('message', messageHandler);
          selfRef._closeModal();
          if (options.onSuccess) options.onSuccess(event.data);
        } else if (event.data.type === 'lingoung.payment.cancel') {
          window.removeEventListener('message', messageHandler);
          handleClose();
        }
      };

      window.addEventListener('message', messageHandler);
      this._activeMessageHandler = messageHandler;
    },

    _closeModal: function() {
      var modal = document.getElementById('lingoung-checkout-modal');
      if (modal && modal.parentNode) {
        modal.parentNode.removeChild(modal);
      }
      if (this._activeMessageHandler) {
        window.removeEventListener('message', this._activeMessageHandler);
        this._activeMessageHandler = null;
      }
    },

    _openPopup: function(url, paymentId, options) {
      var w = 480, h = 720;
      var left = (window.screen.width / 2) - (w / 2);
      var top = (window.screen.height / 2) - (h / 2);
      var popup = window.open(url, 'LingoungCheckout', 'width=' + w + ',height=' + h + ',top=' + top + ',left=' + left + ',scrollbars=yes,status=no,resizable=yes');

      var timer = setInterval(function() {
        if (!popup || popup.closed) {
          clearInterval(timer);
          if (options.onCancel) options.onCancel();
        }
      }, 500);

      var selfRef = this;
      var messageHandler = function(event) {
        if (!event.data) return;
        if (event.data.type === 'lingoung.payment.success') {
          clearInterval(timer);
          window.removeEventListener('message', messageHandler);
          if (popup && !popup.closed) popup.close();
          if (options.onSuccess) options.onSuccess(event.data);
        }
      };
      window.addEventListener('message', messageHandler);
    },

    init: function() {
      var self = this;
      var buttons = document.querySelectorAll('[data-lingoung-checkout], [data-lingoung-pay], [data-lingoung-button]');
      buttons.forEach(function(btn) {
        if (btn.__lingoung_bound) return;
        btn.__lingoung_bound = true;

        btn.addEventListener('click', function(e) {
          e.preventDefault();
          var apiKey = btn.getAttribute('data-api-key') || btn.getAttribute('data-key');
          var amount = btn.getAttribute('data-amount') || btn.getAttribute('data-price') || 10;
          var currency = btn.getAttribute('data-currency') || 'USD';
          var description = btn.getAttribute('data-description') || btn.getAttribute('data-name') || 'Payment';
          var customerName = btn.getAttribute('data-customer-name') || undefined;
          var customerEmail = btn.getAttribute('data-customer-email') || undefined;
          var mode = btn.getAttribute('data-mode') || 'modal';

          self.checkout({
            apiKey: apiKey,
            amount: parseFloat(amount),
            currency: currency,
            description: description,
            customerName: customerName,
            customerEmail: customerEmail,
            mode: mode,
            onSuccess: function(data) {
              var customEvt = new CustomEvent('lingoung:success', { detail: data });
              btn.dispatchEvent(customEvt);
              if (btn.hasAttribute('data-success-redirect')) {
                window.location.href = btn.getAttribute('data-success-redirect');
              }
            },
            onCancel: function() {
              btn.dispatchEvent(new CustomEvent('lingoung:cancel'));
            },
            onError: function(err) {
              btn.dispatchEvent(new CustomEvent('lingoung:error', { detail: err }));
            }
          });
        });
      });
    }
  };

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() { LingoungPay.init(); });
    } else {
      LingoungPay.init();
    }
  }

  window.LingoungPay = LingoungPay;
})(window, document);