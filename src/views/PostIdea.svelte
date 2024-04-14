<script>
    import Menu from "../components/Sidebar/Sidebar.svelte";
    import Footer from "../components/Footers/Footer.svelte";
    import { contentContainerClass } from "../helperStore.js";
    import Banner from "../components/Banner.svelte";
    import ToolBar from "../components/Toolbar/Toolbar.svelte";
    import PostIdeaWidget from "../components/Widgets/PostIdeaWidget.svelte";

    let bannerImage = "../../img/Banner1u.png";
    let title = "BitSpark";
    let subtitle = "Spark idea";
</script>

<main class="overview-page">
    <Menu />
    <div class="flex-grow">
        <Banner {bannerImage} {title} {subtitle} show_right_text={true} />
        <ToolBar />
        <div class={$contentContainerClass}>
            <PostIdeaWidget />
        </div>
    </div>
    <Footer />
</main>
