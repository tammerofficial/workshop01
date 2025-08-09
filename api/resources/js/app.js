import './bootstrap';

// Mobile Menu Toggle
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const mobileSidebar = document.getElementById('mobile-sidebar');

    if (mobileMenuBtn && mobileOverlay && mobileSidebar) {
        // Open mobile menu
        mobileMenuBtn.addEventListener('click', function () {
            mobileOverlay.classList.remove('hidden');
            mobileSidebar.classList.remove('translate-x-full');
        });

        // Close mobile menu when clicking overlay
        mobileOverlay.addEventListener('click', function () {
            mobileOverlay.classList.add('hidden');
            mobileSidebar.classList.add('translate-x-full');
        });
    }

    // Flash message auto-hide
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(function (message) {
        setTimeout(function () {
            message.style.opacity = '0';
            setTimeout(function () {
                message.remove();
            }, 300);
        }, 5000);
    });

    // Form validation helpers
    window.validateForm = function (formId) {
        const form = document.getElementById(formId);
        if (!form) return false;

        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(function (field) {
            if (!field.value.trim()) {
                field.classList.add('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
                isValid = false;
            } else {
                field.classList.remove('border-red-300', 'focus:border-red-500', 'focus:ring-red-500');
            }
        });

        return isValid;
    };

    // Table search functionality
    window.searchTable = function (searchInput, tableId) {
        const input = document.getElementById(searchInput);
        const table = document.getElementById(tableId);
        
        if (!input || !table) return;

        input.addEventListener('keyup', function () {
            const filter = input.value.toLowerCase();
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach(function (row) {
                const text = row.textContent.toLowerCase();
                if (text.includes(filter)) {
                    row.style.display = '';
                } else {
                    row.style.display = 'none';
                }
            });
        });
    };

    // Confirm delete
    window.confirmDelete = function (message = 'هل أنت متأكد من الحذف؟') {
        return confirm(message);
    };

    // Loading state for buttons
    window.setLoading = function (buttonId, loading = true) {
        const button = document.getElementById(buttonId);
        if (!button) return;

        if (loading) {
            button.disabled = true;
            button.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> جاري المعالجة...';
        } else {
            button.disabled = false;
            button.innerHTML = button.getAttribute('data-original-text') || 'حفظ';
        }
    };

    // Auto-save form data to localStorage
    window.autoSaveForm = function (formId) {
        const form = document.getElementById(formId);
        if (!form) return;

        const saveKey = `form_${formId}`;

        // Load saved data
        const savedData = localStorage.getItem(saveKey);
        if (savedData) {
            const data = JSON.parse(savedData);
            Object.keys(data).forEach(function (key) {
                const field = form.querySelector(`[name="${key}"]`);
                if (field) {
                    field.value = data[key];
                }
            });
        }

        // Save on input
        form.addEventListener('input', function (e) {
            const formData = new FormData(form);
            const data = {};
            for (let [key, value] of formData.entries()) {
                data[key] = value;
            }
            localStorage.setItem(saveKey, JSON.stringify(data));
        });

        // Clear on submit
        form.addEventListener('submit', function () {
            localStorage.removeItem(saveKey);
        });
    };
});

// Global AJAX setup
if (window.axios) {
    window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
    
    // Add CSRF token to all requests
    let token = document.head.querySelector('meta[name="csrf-token"]');
    if (token) {
        window.axios.defaults.headers.common['X-CSRF-TOKEN'] = token.content;
    }
}

// Export functions for external use
window.WorkshopUI = {
    validateForm: window.validateForm,
    searchTable: window.searchTable,
    confirmDelete: window.confirmDelete,
    setLoading: window.setLoading,
    autoSaveForm: window.autoSaveForm
};