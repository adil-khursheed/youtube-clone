import { useParams } from "react-router-dom";
import {
  useGetCurrentUser,
  useGetUserChannelProfile,
} from "../features/authApi";
import {
  Button,
  Loader,
  TabContent,
  TabNavItem,
  VideoPostCard,
} from "../components/index";
import { BellAlertIcon, PlayCircleIcon } from "@heroicons/react/24/solid";
import { BellIcon, PencilSquareIcon } from "@heroicons/react/24/outline";
import { useToggleSubscription } from "../features/subscriptionApi";
import { toast } from "react-toastify";
import { useState } from "react";
import InfiniteScroll from "react-infinite-scroller";
import { useGetVideosByUserId } from "../features/videoApi";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("videos");
  const { username } = useParams();

  const { data: currentUser, isLoading: currentUserLoading } =
    useGetCurrentUser();

  const { data: profileData, isLoading: profileLoading } =
    useGetUserChannelProfile(username);

  const userId = profileData?.data?._id;

  const {
    mutateAsync: toggleSubscription,
    isPending: toggleSubscriptionLoading,
  } = useToggleSubscription({ channelId: profileData?.data?._id });

  const {
    data: userVideos,
    isLoading: userVideosLoading,
    fetchNextPage,
    hasNextPage,
  } = useGetVideosByUserId(userId);

  const handleToggleSubscription = async () => {
    const response = await toggleSubscription();
    if (response) {
      toast.success(response?.message);
    }
  };

  if (profileLoading) {
    return <Loader />;
  }

  if (currentUserLoading) {
    return <Loader />;
  }

  return (
    <>
      <InfiniteScroll
        loadMore={fetchNextPage}
        hasMore={!userVideosLoading && hasNextPage}
        pageStart={1}
        loader={<Loader />}
        className="w-full h-full px-4 py-3 flex flex-col justify-start gap-3 overflow-x-hidden overflow-y-auto">
        <div className="w-full h-40 aspect-video rounded-lg border border-light-2 dark:border-dark-2">
          <img
            src={profileData?.data?.coverImage?.url}
            alt={profileData?.data?.fullName}
            className="w-full h-full object-contain rounded-lg"
          />
        </div>

        <div className="flex items-start gap-6">
          <div className="w-36 h-w-36 rounded-full">
            <img
              src={profileData?.data?.avatar?.url}
              alt={profileData?.data?.fullName}
              className="w-full h-full object-cover object-top rounded-full"
            />
          </div>
          <div className="flex flex-col justify-start gap-3">
            <h1 className="text-dark-1 dark:text-light-1 font-semibold text-3xl capitalize">
              {profileData?.data?.fullName}
            </h1>
            <p className="flex items-center gap-3 text-dark-2 dark:text-light-2 text-base">
              <span>{profileData?.data?.username}</span>
              <span>&middot;</span>
              <span>
                {profileData?.data?.subscribersCount}{" "}
                {profileData?.data?.subscribersCount === 1
                  ? "subscriber"
                  : "subscribers"}
              </span>
              {profileData?.data?.uploadedVideosCount > 0 && (
                <span>&middot;</span>
              )}
              {profileData?.data?.uploadedVideosCount > 0 && (
                <span>
                  {profileData?.data?.uploadedVideosCount}{" "}
                  {profileData?.data?.uploadedVideosCount === 1
                    ? "video"
                    : "videos"}
                </span>
              )}
            </p>
            <div className="block">
              {currentUser?.data?._id !== profileData?.data?._id ? (
                <Button
                  bgColor={`${
                    profileData?.data?.isSubscribed
                      ? "bg-light-2 dark:bg-dark-2"
                      : "bg-transparent"
                  }`}
                  textColor="text-dark-1 dark:text-light-1"
                  className="px-4 flex items-center justify-center gap-1 border border-light-2 dark:border-dark-2 rounded-r-full rounded-l-full"
                  onClick={handleToggleSubscription}>
                  {toggleSubscriptionLoading ? (
                    <Loader />
                  ) : (
                    <>
                      {profileData?.data?.isSubscribed ? (
                        <BellAlertIcon className="w-6 h-6" />
                      ) : (
                        <BellIcon className="w-6 h-6" />
                      )}
                      <span className="font-medium">
                        {profileData?.data?.isSubscribed
                          ? "Subscribed"
                          : "Subscribe"}
                      </span>
                    </>
                  )}
                </Button>
              ) : (
                <Button
                  bgColor="bg-light-2 dark:bg-dark-2"
                  textColor="text-dark-1 dark:text-light-1"
                  className="px-4 flex items-center justify-center gap-1 border border-light-2 dark:border-dark-2 rounded-r-full rounded-l-full">
                  <PencilSquareIcon className="w-5 h-5" />
                  <span>Edit</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        <div className="w-full mt-5">
          <ul className="w-full grid grid-cols-4 gap-1">
            <TabNavItem
              title="Videos"
              id="videos"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabNavItem
              title="Playlist"
              id="playlist"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabNavItem
              title="Tweets"
              id="tweets"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
            <TabNavItem
              title="Subscribed"
              id="subscribed"
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </ul>
          <hr className="border-light-2 dark:border-dark-2 my-1" />
          <div className="w-full">
            {userVideosLoading ? (
              <Loader />
            ) : (
              <>
                <TabContent id={"videos"} activeTab={activeTab}>
                  {userVideos?.pages?.map((page, index) => (
                    <div key={index} className="w-full">
                      {page?.data?.videos.length > 0 ? (
                        <div
                          key={index}
                          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {page?.data?.videos.map((video) => (
                            <VideoPostCard key={video?._id} video={video} />
                          ))}
                        </div>
                      ) : (
                        <div className="max-w-96 w-full mx-auto text-center flex flex-col items-center justify-center gap-2 mt-10 text-dark-2 dark:text-light-2">
                          <PlayCircleIcon className="w-8 h-8" />
                          <h5>No videos uploaded</h5>
                          <p>
                            This page has yet to upload a video. Search another
                            page in order to find more videos.
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </TabContent>
              </>
            )}
          </div>
        </div>
      </InfiniteScroll>
    </>
  );
};

export default Profile;
