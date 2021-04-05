"use strict"; 

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  console.debug("generateStoryMarkup", story);
  // console.log(story);
  const hostName = story.getHostName();
  if(!currentUser){
    
    return $(`
        <li id="${story.storyId}">
          <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
          </a>
          <small class="story-hostname">(${hostName})</small>
          <small class="story-author">by ${story.author}</small>
          <small class="story-user">posted by ${story.username}</small>
        </li>
      `);
  } 
  else {
    // console.log(currentUser.favorites[0].storyId);
    // console.log(currentUser.favorites.story.storyId);
    if(currentUser.favorites[0].storyId === story.storyId){

      return $(`
          <li id="${story.storyId}">
            <span class="star">
              <i class="fas fa-star"></i>
            </span>
            <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </li>
      `);
    }
    else {
      return $(`
          <li id="${story.storyId}">
            <span class="star">
              <i class="far fa-star"></i>
            </span>
            <a href="${story.url}" target="a_blank" class="story-link">
            ${story.title}
            </a>
            <small class="story-hostname">(${hostName})</small>
            <small class="story-author">by ${story.author}</small>
            <small class="story-user">posted by ${story.username}</small>
          </li>
      `);
    }  
  }
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
}

async function submitStoryClick(){
  // evt.preventDefault();

  const author = $("#author-input").val();
  const title = $("#title-input").val();
  const url = $("#url-input").val();
  const username = currentUser.user;

  const story = await storyList.addStory(currentUser, { author, title, url, username });
  console.log(story);
  // $("#author-input").val("");
  // $("#title-input").val("");
  // $("#url-input").val("");
  $storyForm.trigger("reset");
  hidePageComponents();
  getAndShowStoriesOnStart();
}

$storyForm.on("submit", submitStoryClick);
