(function() {
    'use strict';
    
    // Default configuration
    const defaultConfig = {
        window_title: "AI Assistant",
        subtitle: "Ask me anything",
        flow_id: "",
        host_url: "",
        api_key: "",
        position: "bottom-right", // bottom-right, bottom-left, top-right, top-left
        theme: "dark", // dark, light
        accent_color: "#6366f1" // default indigo
    };

    // Get configuration from script tag attributes
    function getConfig() {
        let script = document.currentScript;
        
        // Fallback methods to find the script tag
        if (!script) {
            // Try to find script by src containing our filename
            const scripts = document.querySelectorAll('script[src*="custom-chat-embed"]');
            if (scripts.length > 0) {
                script = scripts[scripts.length - 1]; // Get the last one (most recent)
            }
        }
        
        if (!script) {
            // Try to find any script with our data attributes
            script = document.querySelector('script[data-flow-id]');
        }
        
        if (!script) {
            console.error('Custom Chat Widget: Could not find script tag with configuration');
            return defaultConfig;
        }
        
        const config = {
            window_title: script.getAttribute('data-title') || defaultConfig.window_title,
            subtitle: script.getAttribute('data-subtitle') || defaultConfig.subtitle,
            flow_id: script.getAttribute('data-flow-id') || defaultConfig.flow_id,
            host_url: script.getAttribute('data-host-url') || defaultConfig.host_url,
            api_key: script.getAttribute('data-api-key') || defaultConfig.api_key,
            position: script.getAttribute('data-position') || defaultConfig.position,
            theme: script.getAttribute('data-theme') || defaultConfig.theme,
            accent_color: script.getAttribute('data-accent-color') || defaultConfig.accent_color
        };
        
        // Debug log to help troubleshoot
        console.log('Custom Chat Widget Config:', {
            found_script: !!script,
            flow_id: config.flow_id ? 'found' : 'missing',
            host_url: config.host_url ? 'found' : 'missing',
            api_key: config.api_key ? 'found' : 'missing'
        });
        
        return config;
    }

    // Inject CSS styles
    function injectStyles() {
        const css = `
        /* Custom Chat Widget Styles */
        .ccw-container {
            --ccw-accent-color: #6366f1;
            --ccw-accent-color-hover: #5b5ef0;
            --ccw-accent-color-light: rgba(99, 102, 241, 0.1);
            --ccw-accent-color-border: rgba(99, 102, 241, 0.2);
            --ccw-accent-color-focus: rgba(99, 102, 241, 0.08);
            --ccw-accent-color-shadow: rgba(99, 102, 241, 0.3);
        }

        .ccw-container * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        /* Chat Button */
        .ccw-chat-button {
            position: fixed;
            width: 56px;
            height: 56px;
            background: rgba(20, 20, 20, 0.8);
            backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            border-radius: 16px;
            cursor: pointer;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .ccw-chat-button.ccw-bottom-right {
            bottom: 24px;
            right: 24px;
        }

        .ccw-chat-button.ccw-bottom-left {
            bottom: 24px;
            left: 24px;
        }

        .ccw-chat-button.ccw-top-right {
            top: 24px;
            right: 24px;
        }

        .ccw-chat-button.ccw-top-left {
            top: 24px;
            left: 24px;
        }

        .ccw-chat-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
            background: rgba(30, 30, 30, 0.9);
            border-color: var(--ccw-accent-color);
        }

        .ccw-chat-button svg {
            width: 24px;
            height: 24px;
            fill: #ffffff;
        }

        /* Chat Container */
        .ccw-chat-container {
            position: fixed;
            width: 380px;
            height: 600px;
            background: rgba(13, 13, 13, 0.95);
            backdrop-filter: blur(24px);
            border-radius: 20px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            display: flex;
            flex-direction: column;
            opacity: 0;
            transform: translateY(20px) scale(0.96);
            pointer-events: none;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 1000000;
            border: 1px solid rgba(255, 255, 255, 0.08);
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        }

        .ccw-chat-container.ccw-active {
            opacity: 1;
            transform: translateY(0) scale(1);
            pointer-events: all;
        }

        .ccw-chat-container.ccw-bottom-right {
            bottom: 100px;
            right: 24px;
        }

        .ccw-chat-container.ccw-bottom-left {
            bottom: 100px;
            left: 24px;
        }

        .ccw-chat-container.ccw-top-right {
            top: 100px;
            right: 24px;
        }

        .ccw-chat-container.ccw-top-left {
            top: 100px;
            left: 24px;
        }

        /* Chat Header */
        .ccw-chat-header {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(20px);
            padding: 24px;
            border-radius: 20px 20px 0 0;
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ccw-chat-header-content {
            flex: 1;
        }

        .ccw-chat-title {
            color: #ffffff;
            font-size: 17px;
            font-weight: 500;
            margin-bottom: 2px;
            letter-spacing: -0.01em;
        }

        .ccw-chat-subtitle {
            color: #a1a1aa;
            font-size: 13px;
            font-weight: 400;
        }

        .ccw-close-button {
            width: 36px;
            height: 36px;
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
            margin-left: auto;
        }

        .ccw-close-button:hover {
            background: rgba(255, 255, 255, 0.1);
            border-color: rgba(255, 255, 255, 0.15);
            transform: scale(1.05);
        }

        .ccw-close-button svg {
            width: 18px;
            height: 18px;
            fill: #a1a1aa;
        }

        /* Messages Area */
        .ccw-messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 24px;
            display: flex;
            flex-direction: column;
            gap: 20px;
        }

        .ccw-messages-container::-webkit-scrollbar {
            width: 4px;
        }

        .ccw-messages-container::-webkit-scrollbar-track {
            background: transparent;
        }

        .ccw-messages-container::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 2px;
        }

        .ccw-messages-container::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
        }

        /* Message Bubbles */
        .ccw-message {
            display: flex;
            align-items: flex-start;
            gap: 14px;
            animation: ccw-messageSlide 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        @keyframes ccw-messageSlide {
            from {
                opacity: 0;
                transform: translateY(8px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        .ccw-message.ccw-user {
            flex-direction: row-reverse;
        }

        .ccw-message-avatar {
            width: 32px;
            height: 32px;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: 500;
            flex-shrink: 0;
            border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .ccw-message.ccw-assistant .ccw-message-avatar {
            background: var(--ccw-accent-color-light);
            color: var(--ccw-accent-color);
            border-color: var(--ccw-accent-color-border);
        }

        .ccw-message.ccw-user .ccw-message-avatar {
            display: none;
        }

        .ccw-message-content {
            max-width: 75%;
            padding: 14px 18px;
            border-radius: 16px;
            font-size: 14px;
            line-height: 1.5;
            border: 1px solid rgba(255, 255, 255, 0.06);
        }

        .ccw-message.ccw-assistant .ccw-message-content {
            background: rgba(20, 20, 20, 0.4);
            color: #ffffff;
            border-radius: 16px 16px 16px 6px;
        }

        .ccw-message.ccw-user .ccw-message-content {
            background: var(--ccw-accent-color-light);
            color: #ffffff;
            border-radius: 16px 16px 6px 16px;
            border-color: var(--ccw-accent-color-border);
        }

        /* Typing Indicator */
        .ccw-typing-indicator {
            display: flex;
            gap: 6px;
            padding: 14px 18px;
            background: rgba(20, 20, 20, 0.4);
            border: 1px solid rgba(255, 255, 255, 0.06);
            border-radius: 16px;
            width: fit-content;
        }

        .ccw-typing-dot {
            width: 6px;
            height: 6px;
            background: var(--ccw-accent-color);
            border-radius: 50%;
            animation: ccw-typing 1.6s infinite;
        }

        .ccw-typing-dot:nth-child(2) {
            animation-delay: 0.2s;
        }

        .ccw-typing-dot:nth-child(3) {
            animation-delay: 0.4s;
        }

        @keyframes ccw-typing {
            0%, 60%, 100% {
                opacity: 0.4;
                transform: translateY(0);
            }
            30% {
                opacity: 1;
                transform: translateY(-6px);
            }
        }

        /* Input Area */
        .ccw-input-container {
            padding: 24px;
            border-top: 1px solid rgba(255, 255, 255, 0.06);
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(20px);
            border-radius: 0 0 20px 20px;
        }

        .ccw-input-form {
            display: flex;
            gap: 14px;
            align-items: center;
        }

        .ccw-message-input {
            flex: 1;
            background: rgba(255, 255, 255, 0.04);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 14px;
            padding: 14px 18px;
            color: #ffffff;
            font-size: 14px;
            outline: none;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            font-family: inherit;
        }

        .ccw-message-input:focus {
            border-color: var(--ccw-accent-color);
            background: rgba(255, 255, 255, 0.06);
            box-shadow: 0 0 0 4px var(--ccw-accent-color-focus);
        }

        .ccw-message-input::placeholder {
            color: #71717a;
        }

        .ccw-send-button {
            width: 44px;
            height: 44px;
            background: var(--ccw-accent-color);
            border: none;
            border-radius: 14px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .ccw-send-button:hover {
            background: var(--ccw-accent-color-hover);
            transform: translateY(-1px);
            box-shadow: 0 6px 20px var(--ccw-accent-color-shadow);
        }

        .ccw-send-button:disabled {
            opacity: 0.4;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .ccw-send-button svg {
            width: 18px;
            height: 18px;
            fill: white;
        }

        /* Light Theme Overrides */
        .ccw-container.ccw-light .ccw-chat-button {
            background: rgba(255, 255, 255, 0.9);
            border: 1px solid rgba(0, 0, 0, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .ccw-container.ccw-light .ccw-chat-button:hover {
            background: rgba(255, 255, 255, 0.95);
            border-color: var(--ccw-accent-color);
            box-shadow: 0 12px 40px rgba(0, 0, 0, 0.2);
        }

        .ccw-container.ccw-light .ccw-chat-button svg {
            fill: #374151;
        }

        .ccw-container.ccw-light .ccw-chat-container {
            background: rgba(255, 255, 255, 0.95);
            border: 1px solid rgba(0, 0, 0, 0.08);
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
        }

        .ccw-container.ccw-light .ccw-chat-header {
            background: rgba(248, 250, 252, 0.8);
            border-bottom: 1px solid rgba(0, 0, 0, 0.06);
        }

        .ccw-container.ccw-light .ccw-chat-title {
            color: #111827;
        }

        .ccw-container.ccw-light .ccw-chat-subtitle {
            color: #6b7280;
        }

        .ccw-container.ccw-light .ccw-close-button {
            background: rgba(0, 0, 0, 0.05);
            border: 1px solid rgba(0, 0, 0, 0.08);
        }

        .ccw-container.ccw-light .ccw-close-button:hover {
            background: rgba(0, 0, 0, 0.1);
            border-color: rgba(0, 0, 0, 0.15);
        }

        .ccw-container.ccw-light .ccw-close-button svg {
            fill: #6b7280;
        }

        .ccw-container.ccw-light .ccw-messages-container::-webkit-scrollbar-thumb {
            background: rgba(0, 0, 0, 0.15);
        }

        .ccw-container.ccw-light .ccw-messages-container::-webkit-scrollbar-thumb:hover {
            background: rgba(0, 0, 0, 0.25);
        }

        .ccw-container.ccw-light .ccw-message.ccw-assistant .ccw-message-avatar {
            background: var(--ccw-accent-color-light);
            color: var(--ccw-accent-color);
            border-color: var(--ccw-accent-color-border);
        }

        .ccw-container.ccw-light .ccw-message.ccw-user .ccw-message-avatar {
            display: none;
        }

        .ccw-container.ccw-light .ccw-message.ccw-assistant .ccw-message-content {
            background: rgba(248, 250, 252, 0.8);
            color: #111827;
            border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .ccw-container.ccw-light .ccw-message.ccw-user .ccw-message-content {
            background: var(--ccw-accent-color-light);
            color: #1f2937;
            border-color: var(--ccw-accent-color-border);
        }

        .ccw-container.ccw-light .ccw-typing-indicator {
            background: rgba(248, 250, 252, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.06);
        }

        .ccw-container.ccw-light .ccw-input-container {
            background: rgba(248, 250, 252, 0.8);
            border-top: 1px solid rgba(0, 0, 0, 0.06);
        }

        .ccw-container.ccw-light .ccw-message-input {
            background: rgba(255, 255, 255, 0.8);
            border: 1px solid rgba(0, 0, 0, 0.1);
            color: #111827;
        }

        .ccw-container.ccw-light .ccw-message-input:focus {
            border-color: var(--ccw-accent-color);
            background: rgba(255, 255, 255, 0.9);
            box-shadow: 0 0 0 4px var(--ccw-accent-color-focus);
        }

        .ccw-container.ccw-light .ccw-message-input::placeholder {
            color: #9ca3af;
        }

        /* Responsive */
        @media (max-width: 480px) {
            .ccw-chat-container {
                width: 100%;
                height: 100%;
                right: 0 !important;
                left: 0 !important;
                top: 0 !important;
                bottom: 0 !important;
                border-radius: 0;
                border: none;
            }

            .ccw-chat-header {
                border-radius: 0;
                padding: 20px;
            }

            .ccw-input-container {
                border-radius: 0;
                padding: 20px;
            }

            .ccw-messages-container {
                padding: 20px;
            }

            .ccw-chat-button {
                bottom: 20px !important;
                right: 20px !important;
                left: auto !important;
                top: auto !important;
            }
        }
        `;

        const style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    // Apply accent color to container
    function applyAccentColor(container, accentColor) {
        // Helper function to convert hex to rgba
        function hexToRgba(hex, alpha = 1) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        // Helper function to darken color (for hover state)
        function darkenColor(hex, amount = 20) {
            const r = Math.max(0, parseInt(hex.slice(1, 3), 16) - amount);
            const g = Math.max(0, parseInt(hex.slice(3, 5), 16) - amount);
            const b = Math.max(0, parseInt(hex.slice(5, 7), 16) - amount);
            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        // Set CSS custom properties
        container.style.setProperty('--ccw-accent-color', accentColor);
        container.style.setProperty('--ccw-accent-color-hover', darkenColor(accentColor));
        container.style.setProperty('--ccw-accent-color-light', hexToRgba(accentColor, 0.1));
        container.style.setProperty('--ccw-accent-color-border', hexToRgba(accentColor, 0.2));
        container.style.setProperty('--ccw-accent-color-focus', hexToRgba(accentColor, 0.08));
        container.style.setProperty('--ccw-accent-color-shadow', hexToRgba(accentColor, 0.3));
    }

    // Create chat widget HTML
    function createChatWidget(config) {
        const container = document.createElement('div');
        container.className = `ccw-container ccw-${config.theme}`;
        
        // Apply custom accent color
        applyAccentColor(container, config.accent_color);
        
        container.innerHTML = `
            <!-- Chat Button -->
            <button class="ccw-chat-button ccw-${config.position}" id="ccw-chat-button">
                <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                </svg>
            </button>

            <!-- Chat Container -->
            <div class="ccw-chat-container ccw-${config.position}" id="ccw-chat-container">
                <div class="ccw-chat-header">
                    <div class="ccw-chat-header-content">
                        <h3 class="ccw-chat-title">${config.window_title}</h3>
                        <p class="ccw-chat-subtitle">${config.subtitle}</p>
                    </div>
                    <button class="ccw-close-button" id="ccw-close-button">
                        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                    </button>
                </div>

                <div class="ccw-messages-container" id="ccw-messages-container">
                    <!-- Welcome message -->
                    <div class="ccw-message ccw-assistant">
                        <div class="ccw-message-avatar">AI</div>
                        <div class="ccw-message-content">
                            Hello! I'm here to help you with any questions. How can I assist you today?
                        </div>
                    </div>
                </div>

                <div class="ccw-input-container">
                    <form class="ccw-input-form" id="ccw-input-form">
                        <input 
                            type="text" 
                            class="ccw-message-input" 
                            id="ccw-message-input" 
                            placeholder="Type your message..."
                            autocomplete="off"
                        />
                        <button type="submit" class="ccw-send-button" id="ccw-send-button">
                            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        `;

        return container;
    }

    // Initialize chat functionality
    function initializeChat(config) {
        let isOpen = false;
        let sessionId = 'session_' + Math.random().toString(36).substr(2, 9);

        const chatButton = document.getElementById('ccw-chat-button');
        const chatContainer = document.getElementById('ccw-chat-container');
        const closeButton = document.getElementById('ccw-close-button');
        const messagesContainer = document.getElementById('ccw-messages-container');
        const messageInput = document.getElementById('ccw-message-input');
        const sendButton = document.getElementById('ccw-send-button');
        const inputForm = document.getElementById('ccw-input-form');

        // Toggle chat
        function toggleChat() {
            isOpen = !isOpen;
            if (isOpen) {
                chatContainer.classList.add('ccw-active');
                messageInput.focus();
            } else {
                chatContainer.classList.remove('ccw-active');
            }
        }

        // Add message to chat
        function addMessage(content, isUser = false) {
            const messageDiv = document.createElement('div');
            messageDiv.className = `ccw-message ${isUser ? 'ccw-user' : 'ccw-assistant'}`;
            
            if (isUser) {
                messageDiv.innerHTML = `
                    <div class="ccw-message-content">${escapeHtml(content)}</div>
                `;
            } else {
                messageDiv.innerHTML = `
                    <div class="ccw-message-avatar">AI</div>
                    <div class="ccw-message-content">${escapeHtml(content)}</div>
                `;
            }
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Show typing indicator
        function showTypingIndicator() {
            const typingDiv = document.createElement('div');
            typingDiv.className = 'ccw-message ccw-assistant';
            typingDiv.id = 'ccw-typing-indicator';
            
            typingDiv.innerHTML = `
                <div class="ccw-message-avatar">AI</div>
                <div class="ccw-typing-indicator">
                    <div class="ccw-typing-dot"></div>
                    <div class="ccw-typing-dot"></div>
                    <div class="ccw-typing-dot"></div>
                </div>
            `;
            
            messagesContainer.appendChild(typingDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Remove typing indicator
        function removeTypingIndicator() {
            const typingIndicator = document.getElementById('ccw-typing-indicator');
            if (typingIndicator) {
                typingIndicator.remove();
            }
        }

        // Escape HTML to prevent XSS
        function escapeHtml(text) {
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }

        // Send message
        async function sendMessage(event) {
            event.preventDefault();
            
            const message = messageInput.value.trim();
            if (!message) return;
            
            // Add user message
            addMessage(message, true);
            
            // Clear input and disable send button
            messageInput.value = '';
            sendButton.disabled = true;
            
            // Show typing indicator
            showTypingIndicator();
            
            try {
                // Send message to Langflow API
                const response = await fetch(`${config.host_url}/api/v1/run/${config.flow_id}?stream=false`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': config.api_key
                    },
                    body: JSON.stringify({
                        input_value: message,
                        output_type: 'chat',
                        input_type: 'chat'
                    })
                });
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                
                // Remove typing indicator
                removeTypingIndicator();
                
                // Extract and display response
                let botResponse = 'I apologize, but I encountered an error processing your request.';
                
                // Try multiple possible response structures
                if (data.outputs && data.outputs.length > 0) {
                    const output = data.outputs[0];
                    if (output.outputs && output.outputs.length > 0) {
                        const messageOutput = output.outputs[0];
                        if (messageOutput.results && messageOutput.results.message) {
                            botResponse = messageOutput.results.message.data.text || botResponse;
                        }
                    }
                } else if (data.result) {
                    botResponse = data.result;
                } else if (data.message) {
                    botResponse = data.message;
                }
                
                // Add bot response
                addMessage(botResponse);
                
            } catch (error) {
                console.error('Error:', error);
                removeTypingIndicator();
                addMessage('I apologize, but I encountered an error. Please try again later.');
            } finally {
                sendButton.disabled = false;
                messageInput.focus();
            }
        }

        // Event listeners
        chatButton.addEventListener('click', toggleChat);
        closeButton.addEventListener('click', toggleChat);
        inputForm.addEventListener('submit', sendMessage);
        
        // Handle Enter key
        messageInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage(e);
            }
        });
    }

    // Initialize the widget
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Small delay to ensure script attributes are fully loaded
        setTimeout(() => {
            const config = getConfig();
        
            // Validate required configuration
            const missingFields = [];
            if (!config.flow_id) missingFields.push('data-flow-id');
            if (!config.host_url) missingFields.push('data-host-url');
            if (!config.api_key) missingFields.push('data-api-key');
            
            if (missingFields.length > 0) {
                console.error('Custom Chat Widget: Missing required configuration attributes:', missingFields.join(', '));
                console.log('Example usage:\n<script src="custom-chat-embed.js"\n  data-flow-id="your-flow-id"\n  data-host-url="https://api.sinn.ai"\n  data-api-key="your-api-key">\n</script>');
                return;
            }

            // Inject styles
            injectStyles();
            
            // Create and append widget
            const widget = createChatWidget(config);
            document.body.appendChild(widget);
            
            // Initialize functionality
            initializeChat(config);
        }, 10);
    }

    // Start initialization
    init();
})(); 