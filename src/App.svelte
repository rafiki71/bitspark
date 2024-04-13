<!-- App.svelte -->
<script>
  import { Router, Route } from "svelte-routing";

  import Home from "./views/Home.svelte";
  import Tutorial from "./views/Tutorial.svelte";

  import Profile from "./views/Profile.svelte";
  import EditProfile from "./views/EditProfile.svelte";

  import Idea from "./views/Idea.svelte";
  import PostIdea from "./views/PostIdea.svelte";
  import IdeaPreview from "./views/IdeaPreview.svelte";

  import Job from "./views/Job.svelte";
  import PostJob from "./views/PostJob.svelte";
  import JobMarket from "./views/JobMarket.svelte";
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
      <Route path="/" component={Home} />
      <Route path="/tutorial/:id" component={Tutorial} />
      <Route path="/overview/:category" let:params component={Home} />

      <Route path="/profile/:profile_id" let:params component={Profile} />
      <Route
        path="/edit_profile/:profile_id"
        let:params
        component={EditProfile}
      />

      <Route path="/idea/:id" component={Idea} />
      <Route path="/postidea" component={PostIdea} />
      <Route path="/preview" component={IdeaPreview} />

      <Route path="/job/:id" component={Job} />
      <Route path="/postjob/:ideaID" let:params component={PostJob} />
      <Route path="/jobmarket" component={JobMarket} />
      <Route path="/jobmanager" component={JobManager} />
    </main>
  </div>
</Router>
