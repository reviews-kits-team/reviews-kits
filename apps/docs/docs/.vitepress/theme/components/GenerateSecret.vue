<script setup>
import { ref } from 'vue'

const props = defineProps({
  varName: {
    type: String,
    default: ''
  }
})

const secret = ref('')
const copied = ref(false)
const copiedCommand = ref(false)
const secretLength = 64

function generateSecret() {
  let result = ''
  const size = secretLength
  
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(size)
    crypto.getRandomValues(array)
    // Convert bytes to string safely
    const charArray = Array.from(array).map(byte => String.fromCharCode(byte))
    result = btoa(charArray.join('')).replace(/=/g, '')
  } else {
    // Fallback
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < size; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
  }
  if (props.varName) {
    secret.value = `${props.varName}=${result}`
  } else {
    secret.value = result
  }
  copied.value = false
}

function copySecret() {
  if (!secret.value) return
  navigator.clipboard.writeText(secret.value).then(() => {
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  })
}

function copyCommand() {
  let cmd = `openssl rand -base64 ${secretLength}`
  if (props.varName) {
    cmd = `echo "${props.varName}=$(openssl rand -base64 ${secretLength})"`
  }
  navigator.clipboard.writeText(cmd).then(() => {
    copiedCommand.value = true
    setTimeout(() => {
      copiedCommand.value = false
    }, 2000)
  })
}
</script>

<template>
  <div class="generate-secret-container">
    <div class="header">
      <div class="title">Generate a Secure Secret</div>
      <div class="desc" v-if="varName">Generator for <code>{{ varName }}</code>.</div>
      <div class="desc" v-else>Generate secure strings for secrets and tokens.</div>
    </div>

    <div class="input-group">
      <input 
        type="text" 
        :value="secret" 
        readonly 
        placeholder="Click Generate to create a secret..." 
        class="secret-input"
        @click="copySecret"
      />
      <button @click="copySecret" class="copy-btn" :disabled="!secret">
        {{ copied ? 'Copied!' : 'Copy' }}
      </button>
      <button @click="generateSecret" class="generate-btn">
        Generate
      </button>
    </div>

    <div class="command-group">
      <div class="command-title">Or use OpenSSL in your terminal:</div>
      <div class="command-box">
        <code v-if="varName">echo "{{ varName }}=$(openssl rand -base64 {{ secretLength }})"</code>
        <code v-else>openssl rand -base64 {{ secretLength }}</code>
        <button @click="copyCommand" class="copy-cmd-btn">
          {{ copiedCommand ? 'Copied!' : 'Copy Command' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.generate-secret-container {
  margin: 1.5rem 0;
  padding: 1.25rem;
  border-radius: 8px;
  background-color: var(--vp-c-bg-soft);
  border: 1px solid var(--vp-c-border);
}
.header {
  margin-bottom: 1rem;
}
.title {
  font-weight: 600;
  color: var(--vp-c-text-1);
}
.desc {
  font-size: 0.9em;
  color: var(--vp-c-text-2);
  margin-top: 0.25rem;
}
.input-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  margin-bottom: 1rem;
}
.secret-input {
  flex: 1;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: 1px solid var(--vp-c-border);
  background-color: var(--vp-c-bg);
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 0.9em;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.secret-input:focus {
  outline: 1px solid var(--vp-c-brand-1);
}
.copy-btn, .generate-btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-weight: 500;
  font-size: 0.9em;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}
.copy-btn {
  background-color: var(--vp-c-bg-alt);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-c-text-1);
}
.copy-btn:hover:not(:disabled) {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.generate-btn {
  background-color: var(--vp-c-brand-1);
  color: white;
  border: 1px solid transparent;
}
.generate-btn:hover {
  background-color: var(--vp-c-brand-2);
}
.command-group {
  padding-top: 1rem;
  border-top: 1px dotted var(--vp-c-border);
}
.command-title {
  font-size: 0.85em;
  color: var(--vp-c-text-2);
  margin-bottom: 0.5rem;
}
.command-box {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: var(--vp-c-bg);
  border: 1px solid var(--vp-c-border);
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
}
.command-box code {
  color: var(--vp-c-text-1);
  background: none;
  padding: 0;
  font-size: 0.85em;
}
.copy-cmd-btn {
  font-size: 0.85em;
  color: var(--vp-c-brand-1);
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}
.copy-cmd-btn:hover {
  background-color: var(--vp-c-bg-soft);
}

@media (max-width: 640px) {
  .input-group {
    flex-direction: column;
    align-items: stretch;
  }
  .copy-btn, .generate-btn {
    width: 100%;
  }
  .command-box {
    flex-direction: column;
    align-items: stretch;
    gap: 0.5rem;
  }
  .copy-cmd-btn {
    align-self: flex-start;
  }
}
</style>
