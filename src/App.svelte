<!-- App.svelte -->
<script>
  import { Router, Route, Link } from "svelte-routing";
  import Overview from "./views/Overview.svelte";
  import IdeaDetail from "./views/IdeaDetail.svelte";
  import TutorialView from "./views/TutorialView.svelte";
  import PostIdea from "./views/PostIdea.svelte";
  //import Login from "./views/Login.svelte";
  import EditProfileView from "./views/EditProfileView.svelte";
  import ProfileView from "./views/ProfileView.svelte";
  import PreView from "./views/IdeaPreview.svelte";
  import PostJob from "./views/PostJob.svelte";
  import JobView from "./views/JobView.svelte";
  import JobManager from "./views/JobManager.svelte";
</script>

<svelte:head>
  <link
    rel="stylesheet"
    href="https://maxcdn.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
  />
</svelte:head>

<Router>
  <div>
    <nav>
      <!-- Navigation links here -->
    </nav>
    <main>
      <Route path="/" component={Overview} />
      <Route path="/overview" component={Overview} />
      <Route path="/preview" component={PreView} />
      <Route path="/jobmanager" component={JobManager} />
      <Route path="/overview/:category" let:params component={Overview} />
      <Route path="/idea/:id" component={IdeaDetail} />
      <Route path="/job/:id" component={JobView} />
      <Route path="/tutorial/:id" component={TutorialView} />
      <Route path="/postidea" component={PostIdea} />
      <Route path="/edit_profile/:profile_id" let:params component={EditProfileView} />
      <Route path="/profile/:profile_id" let:params component={ProfileView} />
      <Route path="/postjob/:ideaID" let:params component={PostJob} />
    </main>
  </div>
</Router>
