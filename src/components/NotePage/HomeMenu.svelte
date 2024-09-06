<script lang="ts">
    import { Clock } from "phosphor-svelte";
    import { UserData } from "../../userData";
    import { currentNote, filesystem } from "../../globals";
    import type { Note } from "../../noteUtils";
    import { onMount } from "svelte";

    let notes: Note[] = [];

    UserData.recentlyOpened.subscribe((value) => {
        for (let recent of value) {
            let note = $filesystem?.getChildByHTMLPathRecursive(recent);

            if (note) {
                notes.push(note);
            }
        }
    });

    function openNote(note: Note) {
        currentNote.set(note);
    }
</script>

<div class="wrapper">
    <div class="title">
        <h1>Welcome Back</h1>
    </div>

    <div class="recent">
        <div class="heading">
            <Clock size={32} />
            <p>Recent Notes</p>
        </div>
        <div class="carousel w-full carousel-center">
            {#each notes as note}
                <div
                    class="carousel-item card recent-item"
                    on:click={() => {
                        openNote(note);
                    }}
                >
                    <figure>
                        <div class="card-color"></div>
                    </figure>
                    <div class="card-body">
                        <div class="card-title">{note.Name}</div>
                    </div>
                </div>
            {/each}

            {#if notes.length === 0}
                <p>No recent notes</p>
            {/if}
        </div>
    </div>
</div>

<style>
    .wrapper {
        display: flex;

        flex-direction: column;

        height: 100%;
        width: 100%;
        padding: 3rem;

        overflow-x: hidden;
        overflow-y: auto;
    }

    .recent {
        display: flex;
        flex-direction: column;

        width: 100%;
        height: 20rem;
    }

    .heading {
        display: flex;
        align-items: center;

        margin-bottom: 1rem;

        font-size: 1.5rem;

        gap: 0.5rem;
    }

    .recent-item {
        width: 10rem;
        height: 10rem;

        box-shadow: var(--shadow);

        background-color: var(--muted);
    }

    .carousel {
        gap: 1rem;

        padding: 1rem;
    }

    .card-body {
        padding: 1rem;
    }

    .card-color {
        width: 100%;
        height: 3rem;

        background-color: var(--muted-foreground);
    }

    .title {
        font-size: 2rem;
        margin-bottom: 1rem;
    }
</style>
