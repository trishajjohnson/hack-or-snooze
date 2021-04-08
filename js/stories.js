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
  // console.debug("generateStoryMarkup", story);
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
    if(currentUser.favorites.includes(story)){
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

function generateMyStoryMarkup(story) {

  const hostName = story.getHostName();
  if(currentUser.ownStories.includes(story) && currentUser.favorites.includes(story)) {
    return $(`
    <li id="${story.storyId}">
      <span class="star">
        <i class="fas fa-star"></i>
      </span>
      <span class="trash-can">
        <i class="far fa-trash-alt"></i>
      </span>
      <a href="${story.url}" target="a_blank" class="story-link">
      ${story.title}
      </a>
      <small class="story-hostname">(${hostName})</small>
      <small class="story-author">by ${story.author}</small>
      <small class="story-user">posted by ${story.username}</small>
    </li>
`);
  } else if(currentUser.ownStories.includes(story) && !(currentUser.favorites.includes(story))) {
    return $(`
      <li id="${story.storyId}">
        <span class="star">
          <i class="far fa-star"></i>
        </span>
        <span class="trash-can">
          <i class="far fa-trash-alt"></i>
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
  const username = currentUser.username;

  const story = await storyList.addStory(currentUser, { author, title, url, username });
  console.log(story);
  $storyForm.trigger("reset");
  hidePageComponents();
  getAndShowStoriesOnStart();
}

$storyForm.on("submit", submitStoryClick);

// put favorites on page 
function putFavoritesOnPage() {
  // console.debug("putFavoritesOnPage");
  const favorites = currentUser.favorites;
  $favStoriesList.empty();

  // loop through all of fav stories and generate HTML for them
  for (let favorite of favorites) {
    const $favorite = generateStoryMarkup(favorite);
    $favStoriesList.append($favorite);
  }

  $favStoriesList.show();
}

// put my stories on page 
function putOwnStoriesOnPage(stories) {
  console.log(stories);
  $myStoriesList.empty();

  // loop through all of fav stories and generate HTML for them
  for (let story of stories) {
    const $story = generateMyStoryMarkup(story);
    $myStoriesList.append($story);
  }

  $myStoriesList.show();
}

// toggle favorite on/off 
async function toggleFavorite(evt) {
  const target = evt.target.closest('i');
  const storyId = target.closest('li').id;
  const story = storyList.stories.find(s => s.storyId === storyId);

  if(target.className === "far fa-star"){
    target.className = "fas fa-star";
    await currentUser.addFavoriteStory(story);
  } 
  else if(target.className === "fas fa-star"){
    target.className = "far fa-star";
    await currentUser.removeFavoriteStory(story);
  }
}

$("ol").on("click", "i", toggleFavorite);

async function deleteStory(evt) {
  
  const storyId = evt.target.closest("li").id;
  const story = storyList.stories.find(s => s.storyId === storyId);
  await storyList.removeStory(story);
  const ownStories = currentUser.ownStories.filter(s => s.storyId !== story.storyId);
  
  putOwnStoriesOnPage(ownStories);

}

$("ol").on("click", ".trash-can", deleteStory);