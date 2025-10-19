// Copilot Prompt Link Generator - Main JavaScript
class CopilotLinkGenerator {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.maxPrompts = 10;
        this.copilotBaseUrl = 'https://copilot.microsoft.com/chats/new?q=';
    }

    initializeElements() {
        this.promptInput = document.getElementById('promptInput');
        this.generateBtn = document.getElementById('generateBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.copyAllBtn = document.getElementById('copyAllBtn');
        this.openAllBtn = document.getElementById('openAllBtn');
        this.lineCount = document.getElementById('lineCount');
        this.errorMessage = document.getElementById('errorMessage');
        this.outputSection = document.getElementById('outputSection');
        this.outputList = document.getElementById('outputList');
        this.generatedUrls = []; // Store generated URLs for opening
    }

    attachEventListeners() {
        // Input events
        this.promptInput.addEventListener('input', () => this.updateLineCount());
        this.promptInput.addEventListener('paste', () => {
            setTimeout(() => this.updateLineCount(), 10);
        });

        // Button events
        this.generateBtn.addEventListener('click', () => this.generateLinks());
        this.clearBtn.addEventListener('click', () => this.clearAll());
        this.copyAllBtn.addEventListener('click', () => this.copyAllLinks());
        this.openAllBtn.addEventListener('click', () => this.openAllLinks());

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    this.generateLinks();
                } else if (e.key === 'l' && e.shiftKey) {
                    e.preventDefault();
                    this.clearAll();
                }
            }
        });

        // Initial line count
        this.updateLineCount();
    }

    updateLineCount() {
        const text = this.promptInput.value.trim();
        const lines = text ? text.split('\n').filter(line => line.trim()).length : 0;
        
        this.lineCount.textContent = `${lines} line${lines !== 1 ? 's' : ''}`;
        
        // Update line count color based on limit
        if (lines > this.maxPrompts) {
            this.lineCount.style.color = '#dc2626';
        } else if (lines > 7) {
            this.lineCount.style.color = '#f59e0b';
        } else {
            this.lineCount.style.color = '#4285f4';
        }

        // Enable/disable generate button
        this.generateBtn.disabled = lines === 0 || lines > this.maxPrompts;
    }

    generateLinks() {
        const text = this.promptInput.value.trim();
        
        if (!text) {
            this.showError('Please enter at least one prompt.');
            return;
        }

        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) {
            this.showError('Please enter at least one valid prompt.');
            return;
        }

        if (lines.length > this.maxPrompts) {
            this.showError(`Please enter no more than ${this.maxPrompts} prompts. You have ${lines.length} prompts.`);
            return;
        }

        this.hideError();
        this.renderOutput(lines);
        this.showOutput();
    }

    renderOutput(prompts) {
        this.outputList.innerHTML = '';
        this.generatedUrls = []; // Reset URLs array

        prompts.forEach((prompt, index) => {
            const promptNumber = index + 1;
            const encodedPrompt = encodeURIComponent(prompt);
            const copilotUrl = `${this.copilotBaseUrl}${encodedPrompt}`;
            
            // Store URL for batch opening
            this.generatedUrls.push(copilotUrl);

            const outputItem = this.createOutputItem(promptNumber, prompt, copilotUrl);
            this.outputList.appendChild(outputItem);
        });
    }

    createOutputItem(number, prompt, url) {
        const item = document.createElement('div');
        item.className = 'output-item';
        
        item.innerHTML = `
            <div class="prompt-number">${number}.</div>
            <div class="prompt-text">${this.escapeHtml(prompt)}</div>
            <a href="${url}" 
               target="_blank" 
               rel="noopener noreferrer" 
               class="prompt-link"
               title="Open in Copilot (new tab)">
                👉 Open in Copilot
            </a>
        `;

        // Add click animation
        const link = item.querySelector('.prompt-link');
        link.addEventListener('click', (e) => {
            link.style.transform = 'scale(0.95)';
            setTimeout(() => {
                link.style.transform = '';
            }, 150);
        });

        return item;
    }

    copyAllLinks() {
        const text = this.promptInput.value.trim();
        const lines = text.split('\n')
            .map(line => line.trim())
            .filter(line => line.length > 0);

        if (lines.length === 0) return;

        let copyText = 'Copilot Prompt Links:\n\n';
        
        lines.forEach((prompt, index) => {
            const promptNumber = index + 1;
            const encodedPrompt = encodeURIComponent(prompt);
            const copilotUrl = `${this.copilotBaseUrl}${encodedPrompt}`;
            
            copyText += `${promptNumber}. ${prompt}\n`;
            copyText += `   → ${copilotUrl}\n\n`;
        });

        this.copyToClipboard(copyText);
    }

    openAllLinks() {
        if (this.generatedUrls.length === 0) {
            this.showError('No links to open. Please generate links first.');
            return;
        }

        // Method 1: Try to open all links immediately (works best with user interaction)
        this.tryDirectOpen();
    }

    tryDirectOpen() {
        // Add loading state
        this.openAllBtn.disabled = true;
        this.openAllBtn.textContent = '🔄 Opening...';

        let successCount = 0;
        let failedUrls = [];

        // Try to open all links at once (most likely to succeed)
        this.generatedUrls.forEach((url, index) => {
            try {
                const newWindow = window.open(url, '_blank', 'noopener,noreferrer');
                if (newWindow && !newWindow.closed) {
                    successCount++;
                } else {
                    failedUrls.push({ url, index: index + 1 });
                }
            } catch (error) {
                console.error(`Failed to open link ${index + 1}:`, error);
                failedUrls.push({ url, index: index + 1 });
            }
        });

        // Check results after a short delay
        setTimeout(() => {
            if (failedUrls.length === 0) {
                // All links opened successfully
                this.showSuccessMessage(`Successfully opened ${successCount} Copilot tabs! 🚀`);
                this.resetOpenAllButton();
            } else if (successCount > 0) {
                // Some links opened, some failed
                this.showPartialSuccess(successCount, failedUrls);
            } else {
                // All links failed - offer alternative methods
                this.showAlternativeMethods();
            }
        }, 500);
    }

    showPartialSuccess(successCount, failedUrls) {
        this.resetOpenAllButton();
        this.showSuccessMessage(`Opened ${successCount} tabs successfully! 🎉`);
        
        if (failedUrls.length > 0) {
            const retryBtn = this.createRetryButton(failedUrls);
            this.insertRetryButton(retryBtn);
        }
    }

    showAlternativeMethods() {
        this.resetOpenAllButton();
        
        // Create help message with solutions
        const helpDiv = document.createElement('div');
        helpDiv.className = 'popup-help';
        helpDiv.innerHTML = `
            <div class="help-content">
                <h4>🚫 浏览器阻止了弹窗</h4>
                <p>请尝试以下解决方案：</p>
                <div class="solution-buttons">
                    <button id="allowPopupBtn" class="solution-btn">
                        🛡️ 允许弹窗并重试
                    </button>
                    <button id="sequentialOpenBtn" class="solution-btn">
                        🔗 逐个手动打开
                    </button>
                    <button id="copyLinksBtn" class="solution-btn">
                        📋 复制链接自己打开
                    </button>
                </div>
                <div class="help-instructions">
                    <p><strong>如何允许弹窗：</strong></p>
                    <ul>
                        <li>Chrome: 点击地址栏右边的弹窗图标</li>
                        <li>Safari: 偏好设置 → 网站 → 弹出式窗口</li>
                        <li>Firefox: 点击地址栏左边的盾牌图标</li>
                        <li>Edge: 点击地址栏右边的弹窗图标</li>
                    </ul>
                </div>
            </div>
        `;

        // Remove existing help if any
        const existingHelp = document.querySelector('.popup-help');
        if (existingHelp) {
            existingHelp.remove();
        }

        // Insert help after output header
        const outputHeader = document.querySelector('.output-header');
        outputHeader.insertAdjacentElement('afterend', helpDiv);

        // Add event listeners
        document.getElementById('allowPopupBtn').addEventListener('click', () => {
            helpDiv.remove();
            this.showPopupInstructions();
        });

        document.getElementById('sequentialOpenBtn').addEventListener('click', () => {
            helpDiv.remove();
            this.startSequentialOpen();
        });

        document.getElementById('copyLinksBtn').addEventListener('click', () => {
            this.copyAllLinks();
            helpDiv.remove();
        });
    }

    showPopupInstructions() {
        const instructDiv = document.createElement('div');
        instructDiv.className = 'popup-instructions';
        instructDiv.innerHTML = `
            <div class="instruction-content">
                <h4>📝 启用弹窗的步骤：</h4>
                <ol>
                    <li>在浏览器地址栏寻找弹窗阻止图标 🚫</li>
                    <li>点击图标并选择"始终允许弹窗"</li>
                    <li>刷新页面</li>
                    <li>重新生成链接并点击"打开所有链接"</li>
                </ol>
                <button id="retryAfterAllow" class="primary-btn">
                    ✅ 我已允许弹窗，重新尝试
                </button>
                <button id="closeInstructions" class="secondary-btn">
                    ❌ 关闭
                </button>
            </div>
        `;

        const outputHeader = document.querySelector('.output-header');
        outputHeader.insertAdjacentElement('afterend', instructDiv);

        document.getElementById('retryAfterAllow').addEventListener('click', () => {
            instructDiv.remove();
            this.tryDirectOpen();
        });

        document.getElementById('closeInstructions').addEventListener('click', () => {
            instructDiv.remove();
        });
    }

    startSequentialOpen() {
        const sequentialDiv = document.createElement('div');
        sequentialDiv.className = 'sequential-open';
        sequentialDiv.innerHTML = `
            <div class="sequential-content">
                <h4>🔗 点击下方按钮逐个打开链接：</h4>
                <div class="sequential-buttons"></div>
                <p class="sequential-note">每次点击都会在新标签页中打开一个 Copilot 对话</p>
            </div>
        `;

        const buttonsContainer = sequentialDiv.querySelector('.sequential-buttons');
        
        this.generatedUrls.forEach((url, index) => {
            const prompts = this.getPrompts();
            const prompt = prompts[index] || `Prompt ${index + 1}`;
            
            const btn = document.createElement('button');
            btn.className = 'sequential-link-btn';
            btn.innerHTML = `${index + 1}. ${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}`;
            btn.addEventListener('click', () => {
                window.open(url, '_blank', 'noopener,noreferrer');
                btn.classList.add('opened');
                btn.innerHTML = `✅ ${btn.innerHTML}`;
                btn.disabled = true;
            });
            
            buttonsContainer.appendChild(btn);
        });

        const outputHeader = document.querySelector('.output-header');
        outputHeader.insertAdjacentElement('afterend', sequentialDiv);
    }

    resetOpenAllButton() {
        this.openAllBtn.disabled = false;
        this.openAllBtn.textContent = '🚀 Open All Links';
    }

    createRetryButton(failedUrls) {
        const retryBtn = document.createElement('button');
        retryBtn.className = 'solution-btn';
        retryBtn.innerHTML = `🔄 重试剩余 ${failedUrls.length} 个链接`;
        retryBtn.addEventListener('click', () => {
            failedUrls.forEach(({ url }) => {
                window.open(url, '_blank', 'noopener,noreferrer');
            });
            retryBtn.remove();
        });
        return retryBtn;
    }

    insertRetryButton(button) {
        const outputHeader = document.querySelector('.output-header');
        if (outputHeader) {
            const retryContainer = document.createElement('div');
            retryContainer.className = 'retry-container';
            retryContainer.style.marginTop = '1rem';
            retryContainer.appendChild(button);
            outputHeader.insertAdjacentElement('afterend', retryContainer);
        }
    }

    async copyToClipboard(text) {
        try {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
            } else {
                // Fallback for older browsers or non-HTTPS
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                document.execCommand('copy');
                textArea.remove();
            }
            
            this.showSuccessMessage('Links copied to clipboard! 📋');
        } catch (err) {
            console.error('Failed to copy:', err);
            this.showError('Failed to copy to clipboard. Please copy manually.');
        }
    }

    clearAll() {
        if (this.promptInput.value.trim() === '' && this.outputSection.style.display === 'none') {
            return;
        }

        // Add confirmation for non-empty input
        if (this.promptInput.value.trim() !== '') {
            if (!confirm('Are you sure you want to clear all content?')) {
                return;
            }
        }

        this.promptInput.value = '';
        this.hideOutput();
        this.hideError();
        this.updateLineCount();
        this.promptInput.focus();
        this.generatedUrls = []; // Clear stored URLs
        this.resetOpenAllButton(); // Reset button state
        this.clearHelpElements(); // Clear help elements
    }

    clearHelpElements() {
        // Remove any help elements that might be showing
        const helpElements = document.querySelectorAll(
            '.popup-help, .popup-instructions, .sequential-open, .retry-container'
        );
        helpElements.forEach(element => element.remove());
    }

    showOutput() {
        this.outputSection.style.display = 'block';
        this.outputSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }

    hideOutput() {
        this.outputSection.style.display = 'none';
    }

    showError(message) {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.errorMessage.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'center' 
        });
    }

    hideError() {
        this.errorMessage.style.display = 'none';
    }

    showSuccessMessage(message) {
        // Remove any existing success messages
        const existingMessages = document.querySelectorAll('.success-message');
        existingMessages.forEach(msg => msg.remove());

        const successDiv = document.createElement('div');
        successDiv.className = 'success-message';
        successDiv.textContent = message;
        
        document.body.appendChild(successDiv);
        
        // Auto-remove after animation
        setTimeout(() => {
            if (successDiv.parentNode) {
                successDiv.remove();
            }
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Check popup support and show helpful tips
    checkPopupSupport() {
        // Create a small informational tip about popup settings
        const tipDiv = document.createElement('div');
        tipDiv.className = 'popup-tip';
        tipDiv.innerHTML = `
            <div class="tip-content">
                <span class="tip-icon">💡</span>
                <span class="tip-text">
                    为了使用"打开所有链接"功能，请确保浏览器允许此网站弹出窗口
                </span>
                <button class="tip-close" onclick="this.parentElement.parentElement.remove()">×</button>
            </div>
        `;

        // Add tip styles
        const style = document.createElement('style');
        style.textContent = `
            .popup-tip {
                background: linear-gradient(45deg, #e3f2fd, #f3e5f5);
                border: 1px solid #2196f3;
                border-radius: 8px;
                padding: 0.75rem;
                margin-bottom: 1rem;
                font-size: 0.9rem;
                animation: slideIn 0.5s ease;
            }
            .tip-content {
                display: flex;
                align-items: center;
                gap: 0.5rem;
            }
            .tip-icon {
                font-size: 1.2rem;
            }
            .tip-text {
                flex: 1;
                color: #1565c0;
            }
            .tip-close {
                background: none;
                border: none;
                font-size: 1.2rem;
                cursor: pointer;
                color: #666;
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .tip-close:hover {
                background: rgba(0,0,0,0.1);
            }
        `;
        document.head.appendChild(style);

        // Insert tip at the beginning of main content
        const main = document.querySelector('main');
        main.insertBefore(tipDiv, main.firstChild);

        // Auto-hide tip after 10 seconds
        setTimeout(() => {
            if (tipDiv.parentNode) {
                tipDiv.style.opacity = '0';
                setTimeout(() => tipDiv.remove(), 300);
            }
        }, 10000);
    }

    // Public methods for external use
    setPrompts(prompts) {
        if (Array.isArray(prompts)) {
            this.promptInput.value = prompts.join('\n');
            this.updateLineCount();
        }
    }

    getPrompts() {
        const text = this.promptInput.value.trim();
        return text ? text.split('\n').map(line => line.trim()).filter(line => line.length > 0) : [];
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.copilotGenerator = new CopilotLinkGenerator();
    
    // Check popup support and show helpful tip
    window.copilotGenerator.checkPopupSupport();
    
    // Add some sample prompts for demonstration (can be removed)
    const samplePrompts = [
        'Generate a product landing page for a fitness app',
        'Write a 3-minute bedtime story for children',
        'Design a modern AI chatbot interface',
        'Create a weekly meal plan for vegetarians',
        'Explain quantum computing in simple terms'
    ];
    
    // Uncomment the next line to pre-fill with sample prompts
    // window.copilotGenerator.setPrompts(samplePrompts);
});

// Add some utility functions for enhanced functionality
const Utils = {
    // Validate URL format
    isValidUrl: (string) => {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    },

    // Format prompts for export
    formatPromptsForExport: (prompts, format = 'text') => {
        const baseUrl = 'https://copilot.microsoft.com/chats/new?q=';
        
        switch (format) {
            case 'json':
                return JSON.stringify(prompts.map((prompt, index) => ({
                    id: index + 1,
                    prompt: prompt,
                    url: baseUrl + encodeURIComponent(prompt)
                })), null, 2);
                
            case 'csv':
                let csv = 'Number,Prompt,URL\n';
                prompts.forEach((prompt, index) => {
                    const encodedPrompt = prompt.replace(/"/g, '""');
                    const url = baseUrl + encodeURIComponent(prompt);
                    csv += `${index + 1},"${encodedPrompt}","${url}"\n`;
                });
                return csv;
                
            default: // text
                let text = 'Copilot Prompt Links\n' + '='.repeat(22) + '\n\n';
                prompts.forEach((prompt, index) => {
                    const url = baseUrl + encodeURIComponent(prompt);
                    text += `${index + 1}. ${prompt}\n   → ${url}\n\n`;
                });
                return text;
        }
    },

    // Download function for future export feature
    downloadFile: (content, filename, mimeType = 'text/plain') => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
};

// Make utilities available globally
window.CopilotUtils = Utils;