<script lang="ts">
    import { Clock } from "phosphor-svelte";
    import { UserData } from "../../userData";
    import { currentNote, filesystem } from "../../globals";
    import type { Note } from "../../noteUtils";
    import { onMount } from "svelte";
    import { get } from "svelte/store";

    let notes: Note[] = [];
    let recentlyOpened: string[] = [];

    let recentsCarousel: HTMLDivElement;

    let recentsCarouselLeft = 0;
    let recentsCarouselRight = 0;

    function calculateCarouselEdges() {
        recentsCarouselLeft = getCarouselDistanceFromLeftEdge(recentsCarousel);
        recentsCarouselRight =
            getCarouselDistanceFromRightEdge(recentsCarousel);

        console.log("left", recentsCarouselLeft);
        console.log("right", recentsCarouselRight);
    }

    onMount(() => {
        recentlyOpened = get(UserData.recentlyOpened);

        if (!recentlyOpened) {
            recentlyOpened = [];
        }

        UserData.recentlyOpened.subscribe((value) => {
            console.log("recently opened updated", value);
            recentlyOpened = value;

            if ($filesystem) {
                console.log("updating from user data");
                updateNotes();
            }
        });

        filesystem.subscribe((value) => {
            if (value) {
                console.log("updating from filesystem");
                updateNotes();
            }
        });

        calculateCarouselEdges();
    });

    function updateNotes() {
        console.log("recently opened read as", recentlyOpened);

        for (let recent of recentlyOpened) {
            let note = $filesystem?.getChildByHTMLPathRecursive(recent);

            if (note) {
                notes.push(note);
            }
        }

        notes = [...notes];
    }

    function openNote(note: Note) {
        currentNote.set(note);
    }

    function getCarouselDistanceFromLeftEdge(carousel: HTMLDivElement) {
        if (!carousel) {
            return 0;
        }

        return carousel.scrollLeft;
    }

    function getCarouselDistanceFromRightEdge(carousel: HTMLDivElement) {
        if (!carousel) {
            return 0;
        }

        return (
            carousel.scrollWidth - carousel.scrollLeft - carousel.clientWidth
        );
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
        <div class="w-full carousel-wrapper">
            <div
                class="left-gradient"
                class:gradient-hidden={recentsCarouselLeft < 10}
            ></div>
            <div
                class="right-gradient"
                class:gradient-hidden={recentsCarouselRight < 10}
            ></div>
            <div
                class="carousel w-full carousel-center"
                bind:this={recentsCarousel}
                on:scroll={calculateCarouselEdges}
            >
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

        transition: transform 0.2s;
    }

    .recent-item:hover {
        cursor: pointer;
        outline: 1px solid var(--double-muted);
        transform: scale(1.03);
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

    .carousel-wrapper {
        position: relative;
    }

    .left-gradient {
        position: absolute;
        top: 0;
        left: 0;
        width: 10rem;
        height: 100%;
        background: linear-gradient(to right, var(--background), transparent);

        z-index: 100;

        opacity: 1;

        transition: 0.2s;

        pointer-events: none;
    }

    .right-gradient {
        position: absolute;
        top: 0;
        right: 0;
        width: 10rem;
        height: 100%;
        background: linear-gradient(to left, var(--background), transparent);

        z-index: 100;

        opacity: 1;

        transition: opacity 0.1s;

        pointer-events: none;
    }

    .gradient-hidden {
        opacity: 0;
    }
</style>
