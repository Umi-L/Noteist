<script lang="ts">
    import { CheckCircle, Info, WarningCircle, X } from "phosphor-svelte";
    import { setAddToast, type ToastData } from "../../globals";
    import { onMount } from "svelte";

    interface Toast {
        data: ToastData;
    }

    const duration = 5000;
    const iconSize = 24;
    const closeButtonSize = 14;

    let toasts: Array<ToastData> = [];

    function addToast(toast: ToastData) {
        toasts = [...toasts, toast];

        setTimeout(() => {
            toasts = toasts.filter((t) => t !== toast);
        }, duration);
    }

    onMount(() => {
        setAddToast(addToast);
    });
</script>

<div class="toast">
    {#each toasts as toast}
        <div
            class="alert"
            role="alert"
            class:alert-error={toast.data.type == "error"}
            class:alert-info={toast.data.type == "info"}
            class:alert-success={toast.data.type == "success"}
        >
            {#if toast.data.type == "error"}
                <WarningCircle size={iconSize} />
            {:else if toast.data.type == "info"}
                <Info size={iconSize} />
            {:else if toast.data.type == "success"}
                <CheckCircle size={iconSize} />
            {/if}
            <span>{toast.data.text}</span>

            <button
                class="btn btn-square btn-sm btn-ghost"
                on:click={() => {
                    toasts = toasts.filter((t) => t !== toast);
                }}
            >
                <X size={closeButtonSize} />
            </button>
        </div>
    {/each}
</div>

<style>
    @keyframes fade-out {
        0% {
            opacity: 1;
        }

        80% {
            opacity: 1;
        }

        100% {
            opacity: 0;
        }
    }

    .toast {
        z-index: 10000;
    }

    .alert {
        animation: fade-out 5s forwards;
    }

    .alert :hover {
        opacity: 0.7;

        transition: opacity 0.3s;
    }
</style>
