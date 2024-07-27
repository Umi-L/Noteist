<script lang="ts">
    export let name: string;
</script>

<div class="setting">
    <b>{name}</b>

    <div class="content">
        <slot></slot>
    </div>
</div>

<style>
    .setting {
        width: 100%;

        display: flex;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;

        background-color: var(--muted);

        padding: 1rem;
        border-radius: 10px;

        margin-bottom: 0.5rem;
    }

    .content {
    }
</style>
