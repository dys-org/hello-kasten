<script setup lang="ts">
import hljs from 'https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/es/highlight.min.js';
import MarkdownIt from 'markdown-it';
import { computed } from 'vue';

import { sleep } from '@/lib/utils';

interface Props {
  content: string;
  role: 'user' | 'assistant';
  isStreaming?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isStreaming: false,
});

const md: MarkdownIt = new MarkdownIt({
  highlight: (str, lang) => {
    const wrapStart =
      '<pre class="hljs relative">' +
      '<div class="code-container">' +
      `<button type="button" class="copy-button absolute right-0 top-1 rounded px-2.5 py-1.5 leading-none text-white opacity-60 transition-opacity hover:opacity-100 dark:bg-[#011627] disabled:pointer-events-none" aria-label="Copy Code" title="Copy Code" ${props.isStreaming ? 'disabled' : ''}>` +
      '<span class="i-lucide-copy size-4" aria-hidden="true"></span>' +
      '</button><code>';
    const wrapEnd = '</code></div></pre>';

    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          wrapStart + hljs.highlight(str, { language: lang, ignoreIllegals: true }).value + wrapEnd
        );
      } catch (err) {
        console.warn('Error highlighting code block.', err);
      }
    }
    return wrapStart + md.utils.escapeHtml(str) + wrapEnd;
  },
});

const renderedContent = computed(() => md.render(props.content));

async function onCodeCopyClick(button: Element) {
  const container = button.closest('.code-container')?.querySelector('code');
  try {
    await navigator.clipboard.writeText(container?.textContent ?? '');
    const icon = button.querySelector('span');
    icon?.classList.replace('i-lucide-copy', 'i-lucide-copy-check');
    icon?.classList.add('text-primary');
    await sleep(1500);
    icon?.classList.replace('i-lucide-copy-check', 'i-lucide-copy');
    icon?.classList.remove('text-primary');
  } catch (err) {
    console.error('Failed to copy: ', err);
  }
}

// Custom directive to attach click handlers
const vAttachCopyHandlers = {
  mounted: (el: HTMLElement) => {
    attachHandlers(el);
  },
  updated: (el: HTMLElement) => {
    removeHandlers(el);
    attachHandlers(el);
  },
  unmounted: (el: HTMLElement) => {
    removeHandlers(el);
  },
};

function attachHandlers(el: HTMLElement) {
  el.querySelectorAll('.copy-button').forEach((button) => {
    const handler = () => onCodeCopyClick(button);
    button.addEventListener('click', handler);
    // Store the handler on the button element
    (button as any)._copyHandler = handler;
  });
}

function removeHandlers(el: HTMLElement) {
  el.querySelectorAll('.copy-button').forEach((button) => {
    if ((button as any)._copyHandler) {
      button.removeEventListener('click', (button as any)._copyHandler);
      delete (button as any)._copyHandler;
    }
  });
}
</script>

<template>
  <div
    :class="[
      'max-w-[80%] rounded-lg border border-border p-2 shadow-md',
      role === 'user' ? 'ml-auto bg-primary text-primary-foreground' : 'bg-card',
    ]"
  >
    <div
      v-attach-copy-handlers
      class="chat-message leading-7"
      aria-live="polite"
      v-html="renderedContent"
    />
  </div>
</template>

<style>
.chat-message {
  & ol {
    list-style: decimal;
    margin-left: 1rem;
  }

  & li {
    margin-bottom: 1rem;
  }

  & P:not(:last-child) {
    margin-bottom: 1rem;
  }

  & .hljs {
    @apply my-4 w-full text-xs;
  }
  & .code-container {
    @apply w-full overflow-auto p-3;
  }
}
</style>
