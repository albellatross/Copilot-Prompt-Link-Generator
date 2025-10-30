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
        this.copyAutomationBtn = document.getElementById('copyAutomationBtn');
        this.bookmarkletBtn = document.getElementById('bookmarkletBtn');
        this.delayInput = document.getElementById('delayInput');
        this.langToggleBtn = document.getElementById('langToggleBtn');
        this.scriptPreviewWrapper = document.getElementById('scriptPreviewWrapper');
        this.scriptPreview = document.getElementById('scriptPreview');
        this.refreshPreviewBtn = document.getElementById('refreshPreviewBtn');
        this.copyPreviewBtn = document.getElementById('copyPreviewBtn');
    this.togglePreviewBtn = document.getElementById('togglePreviewBtn');
    this.maxCountInput = document.getElementById('maxCountInput');
    this.advancedToggleBtn = document.getElementById('advancedToggleBtn');
    this.advancedPanel = document.getElementById('advancedPanel');
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
    this.copyAutomationBtn.addEventListener('click', () => this.copyAutomationScript());
    this.bookmarkletBtn.addEventListener('click', () => this.generateBookmarklet());
    if (this.delayInput) this.delayInput.addEventListener('change', () => this.updateScriptPreview());
    if (this.langToggleBtn) this.langToggleBtn.addEventListener('click', () => this.toggleLanguage());
    if (this.refreshPreviewBtn) this.refreshPreviewBtn.addEventListener('click', () => this.updateScriptPreview());
    if (this.copyPreviewBtn) this.copyPreviewBtn.addEventListener('click', () => this.copyPreviewScript());
        if (this.togglePreviewBtn) this.togglePreviewBtn.addEventListener('click', () => this.togglePreview());
    if (this.advancedToggleBtn) this.advancedToggleBtn.addEventListener('click', () => this.toggleAdvanced());
        // Load persisted language
        const savedLang = localStorage.getItem('copilot_lang');
        if (savedLang && ['zh','en'].includes(savedLang)) {
            this.currentLang = savedLang;
            this.updateLangTexts();
        }
        // Listen for handshake messages if bookmarklet new tab opened
        window.addEventListener('message', (e) => {
            if (!e.data || typeof e.data !== 'object') return;
            if (e.data.type === 'REQUEST_PROMPTS') {
                e.source.postMessage({ type: 'PROMPTS', prompts: this.getPrompts(), delay: this.getDelay(), max: this.getMaxCount() }, '*');
            }
        });

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

        // Apply max count safety limit
        const limited = this.applyMaxCount(lines);
        if (limited.truncated) {
            this.showSuccessMessage(this.t('limitedTo') + ' ' + limited.prompts.length);
        }
        this.hideError();
        this.renderOutput(limited.prompts);
        this.showOutput();
        this.updateScriptPreview();
        if (this.scriptPreviewWrapper) this.scriptPreviewWrapper.style.display = 'block';
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

    // Generate an automation script that can be pasted into https://copilot.microsoft.com single chat page console
    copyAutomationScript() {
        const prompts = this.getPrompts();
        if (!prompts.length) {
            this.showError('请先生成或输入至少一个 Prompt');
            return;
        }
        // Script: sequentially fill textarea/input, dispatch input/change events and simulate Enter key
        // We wrap in an async IIFE for clarity
        const limited = this.applyMaxCount(prompts);
        const usedPrompts = limited.prompts;
        const escapedPrompts = usedPrompts.map(p => p.replace(/`/g, '\`'));
        const dynDelay = this.getDelay();
        const automationScript = `// === Copilot 自动发送脚本 ===\n// 用法: 在单个 Copilot 会话页面 (https://copilot.microsoft.com/) 打开开发者工具 Console 粘贴后回车执行\n// 它会依次发送下面的 ${prompts.length} 个提示。可随时按 Esc 停止。\n(async () => {\n  const prompts = [\n    ${escapedPrompts.map(p => `\`${p}\``).join(',\n    ')}\n  ];\n  const delay = (ms) => new Promise(r => setTimeout(r, ms));\n  const findInput = () => document.querySelector('textarea, [contenteditable="true"]');\n  let stop = false;\n  window.addEventListener('keydown', e => { if (e.key === 'Escape') { stop = true; console.warn('停止自动发送'); } });\n  for (let i = 0; i < prompts.length; i++) {\n    if (stop) break;\n    const p = prompts[i];\n    let inputEl = findInput();\n    if (!inputEl) { console.error('未找到输入框'); break; }\n    // 设定内容\n    if (inputEl.tagName === 'TEXTAREA') { inputEl.value = p; inputEl.dispatchEvent(new Event('input', { bubbles: true })); }\n    else { inputEl.textContent = p; inputEl.dispatchEvent(new Event('input', { bubbles: true })); }\n    // 模拟按 Enter\n    await delay(200);\n    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });\n    inputEl.dispatchEvent(enterEvent);\n    console.log('已发送 Prompt', i + 1, '/', prompts.length);\n    await delay(2500); // 等待回答生成，可自行调整\n  }\n  console.log('全部完成');\n})();`;
        this.copyToClipboard(automationScript);
        this.showSuccessMessage('已复制自动发送脚本 ✅');
    }

    generateBookmarklet() {
        const prompts = this.getPrompts();
        if (!prompts.length) {
            this.showError('请先输入 Prompt');
            return;
        }
        // Minimal bookmarklet: open copilot page then inject sequential sender after load.
        // Because bookmarklets execute in current page, user需先在 Copilot 页面使用，或我们尝试 window.open 然后提示用户粘贴？
        // 更通用：生成一个可拖到书签栏的链接，点它时如果当前不是 copilot.microsoft.com 就打开，再延迟注入。
        const limited = this.applyMaxCount(prompts);
        const used = limited.prompts.map(p => p.replace(/`/g,'\`'));
        const dynDelay = this.getDelay();
        // Handshake-enabled bookmarklet: if not on copilot, open new tab then instruct; if on copilot, if opener has prompts send REQUEST_PROMPTS
        const code = `(function(){const host=location.hostname;function inject(ps,delay){let i=0;const d=ms=>new Promise(r=>setTimeout(r,ms));const f=()=>document.querySelector('textarea,[contenteditable=\"true\"]');async function run(){for(;i<ps.length;i++){let el=f();if(!el){console.error('No input element');break;}if(el.tagName==='TEXTAREA'){el.value=ps[i];el.dispatchEvent(new Event('input',{bubbles:true}));}else{el.textContent=ps[i];el.dispatchEvent(new Event('input',{bubbles:true}));}await d(150);el.dispatchEvent(new KeyboardEvent('keydown',{key:'Enter',code:'Enter',which:13,keyCode:13,bubbles:true}));await d(delay);}console.log('Done');}run();}if(!/copilot\.microsoft\.com$/.test(host)){const w=window.open('https://copilot.microsoft.com/chats/new','_blank');setTimeout(()=>{alert('新标签已打开，如未自动开始，请在新标签再次点击书签。');},400);}else{if(window.opener){try{window.opener.postMessage({type:'REQUEST_PROMPTS'},'*');window.addEventListener('message',function handler(e){if(e.data&&e.data.type==='PROMPTS'){window.removeEventListener('message',handler);inject(e.data.prompts.slice(0,e.data.max),e.data.delay);}});}catch(e){inject([${used.map(p=>"`"+p+"`").join(',')}],${dynDelay});}}else{inject([${used.map(p=>"`"+p+"`").join(',')}],${dynDelay});}}})();`;
        const bookmarklet = 'javascript:' + encodeURIComponent(code);
        const outputHeader = document.querySelector('.output-header');
        let info = document.getElementById('bookmarkletInfo');
        if (!info) {
            info = document.createElement('div');
            info.id='bookmarkletInfo';
            info.style.marginTop='0.5rem';
            info.style.fontSize='0.8rem';
            info.style.color='#555';
            outputHeader.appendChild(info);
        }
        info.innerHTML = `拖动或右键复制下面的链接到书签栏：<a href="${bookmarklet}" style="color:#e52e71;font-weight:600;" title="拖动我到书签栏">🔖 Copilot批量发送</a>`;
        this.showSuccessMessage('Bookmarklet 已生成');
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
        this.updateScriptPreview();
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

    // ====== Added: automation script preview & i18n ======
    getDelay() {
        if (!this.delayInput) return 2500;
        const v = parseInt(this.delayInput.value, 10);
        return isNaN(v) ? 2500 : Math.max(300, v);
    }
    getMaxCount() {
        if (!this.maxCountInput) return 100;
        const v = parseInt(this.maxCountInput.value, 10);
        return isNaN(v) ? 100 : Math.max(1, Math.min(100, v));
    }
    applyMaxCount(prompts) {
        const max = this.getMaxCount();
        if (prompts.length > max) {
            return { prompts: prompts.slice(0, max), truncated: true };
        }
        return { prompts, truncated: false };
    }
    buildAutomationScript(prompts) {
        const delay = this.getDelay();
        const escapedPrompts = prompts.map(p => p.replace(/`/g, '\\`'));
        return `// === ${this.t('autoScriptTitle')} ===\n// ${this.t('autoScriptUsage', {count:prompts.length})}\n(async () => {\n  const prompts = [\n    ${escapedPrompts.map(p => `\`${p}\``).join(',\n    ')}\n  ];\n  const delay = (ms) => new Promise(r => setTimeout(r, ms));\n  const findInput = () => document.querySelector('textarea, [contenteditable="true"]');\n  let stop = false;\n  window.addEventListener('keydown', e => { if (e.key === 'Escape') { stop = true; console.warn('${this.t('stopped')}'); } });\n  for (let i = 0; i < prompts.length; i++) {\n    if (stop) break;\n    const p = prompts[i];\n    let inputEl = findInput();\n    if (!inputEl) { console.error('${this.t('noInput')}'); break; }\n    if (inputEl.tagName === 'TEXTAREA') { inputEl.value = p; inputEl.dispatchEvent(new Event('input', { bubbles: true })); }\n    else { inputEl.textContent = p; inputEl.dispatchEvent(new Event('input', { bubbles: true })); }\n    await delay(200);\n    const enterEvent = new KeyboardEvent('keydown', { key: 'Enter', code: 'Enter', which: 13, keyCode: 13, bubbles: true });\n    inputEl.dispatchEvent(enterEvent);\n    console.log('${this.t('sentPrompt')}', i + 1, '/', prompts.length);\n    await delay(${delay});\n  }\n  console.log('${this.t('allDone')}');\n})();`;
    }
    updateScriptPreview() {
        if (!this.scriptPreview) return;
        const prompts = this.getPrompts();
        if (!prompts.length) {
            this.scriptPreview.textContent = this.t('previewEmpty');
            return;
        }
        const limited = this.applyMaxCount(prompts);
        this.scriptPreview.textContent = this.buildAutomationScript(limited.prompts).substring(0, 4000);
    }
    togglePreview() {
        if (!this.scriptPreview) return;
        const collapsed = this.scriptPreview.classList.toggle('collapsed');
        if (this.togglePreviewBtn) this.togglePreviewBtn.textContent = collapsed ? '📂 展开' : '📂 折叠';
    }
    toggleAdvanced() {
        if (!this.advancedPanel) return;
        const visible = this.advancedPanel.style.display !== 'none';
        this.advancedPanel.style.display = visible ? 'none' : 'block';
        if (this.advancedToggleBtn) this.advancedToggleBtn.textContent = visible ? '⚙️ Advanced' : '⚙️ Hide';
    }
    copyPreviewScript() {
        if (!this.scriptPreview) return;
        const txt = this.scriptPreview.textContent;
        if (!txt.trim()) return;
        this.copyToClipboard(txt);
        this.showSuccessMessage(this.t('copiedPreview'));
    }
    i18n = {
        zh: {
            autoScriptTitle: 'Copilot 自动发送脚本',
            autoScriptUsage: ({count}) => `用法: 在单个 Copilot 页面 Console 粘贴后执行; 共 ${count} 条, 按 Esc 停止`,
            stopped: '已停止',
            noInput: '未找到输入框',
            sentPrompt: '已发送 Prompt',
            allDone: '全部完成',
            previewEmpty: '暂无脚本预览（请输入 Prompt）',
            copiedPreview: '预览脚本已复制 ✅'
        },
        en: {
            autoScriptTitle: 'Copilot Auto Sender Script',
            autoScriptUsage: ({count}) => `Usage: Paste into Copilot console; ${count} prompts; Esc to stop`,
            stopped: 'Stopped',
            noInput: 'Input element not found',
            sentPrompt: 'Sent prompt',
            allDone: 'Done',
            previewEmpty: 'No script preview (enter prompts)',
            copiedPreview: 'Preview script copied ✅'
        }
    };
    currentLang = 'zh';
    t(key, params = {}) {
        const pack = this.i18n[this.currentLang];
        const val = pack[key];
        return typeof val === 'function' ? val(params) : val;
    }
    toggleLanguage() {
        this.currentLang = this.currentLang === 'zh' ? 'en' : 'zh';
        this.updateLangTexts();
        this.updateScriptPreview();
        try { localStorage.setItem('copilot_lang', this.currentLang); } catch(_) {}
    }
    updateLangTexts() {
        const mapping = {
            promptLabel: { selector: 'label[for="promptInput"]', zh: '输入你的 Prompts (每行一个, 最多 10):', en: 'Enter your prompts (one per line, up to 10):' },
            generateBtn: { selector: '#generateBtn', zh: '✨ 生成链接', en: '✨ Generate Links' },
            clearBtn: { selector: '#clearBtn', zh: '🗑️ 清空', en: '🗑️ Clear All' },
            note: { selector: '.note', zh: '💡 每个链接会打开一个新的 Copilot 对话并预填你的 Prompt', en: '💡 Each link opens a new Copilot chat with your prompt pre-filled' },
            outputTitle: { selector: '.output-header h3', zh: '生成的链接', en: 'Generated Links' },
            openAllBtn: { selector: '#openAllBtn', zh: '🚀 打开全部链接', en: '🚀 Open All Links' },
            copyAllBtn: { selector: '#copyAllBtn', zh: '📋 复制全部链接', en: '📋 Copy All Links' },
            copyAutomationBtn: { selector: '#copyAutomationBtn', zh: '🛠️ 复制自动脚本', en: '🛠️ Copy Auto Script' },
            bookmarkletBtn: { selector: '#bookmarkletBtn', zh: '🔖 生成 Bookmarklet', en: '🔖 Bookmarklet' },
            delayLabel: { selector: '.delay-label', zh: '发送间隔(ms):', en: 'Delay(ms):' },
            previewTitle: { selector: '.preview-title', zh: '脚本预览 / Script Preview', en: 'Script Preview' }
        };
        Object.values(mapping).forEach(item => {
            const el = document.querySelector(item.selector);
            if (el) el.textContent = item[this.currentLang];
        });
        if (this.langToggleBtn) this.langToggleBtn.textContent = this.currentLang === 'zh' ? '🌐 中文 / EN' : '🌐 EN / 中文';
        if (this.togglePreviewBtn) this.togglePreviewBtn.textContent = this.scriptPreview && this.scriptPreview.classList.contains('collapsed') ? (this.currentLang==='zh'?'📂 展开':'📂 Expand') : (this.currentLang==='zh'?'📂 折叠':'📂 Collapse');
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.copilotGenerator = new CopilotLinkGenerator();
    console.log('[Copilot Prompt Link Generator] Version:', window.APP_VERSION || 'dev');
    
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