export const communityRoutes = {
  discussion: (id: string) => `/community/discussion/${id}`,

  circle: (id: string) => `/community/circle/${id}`,

  support: (id: string) => `/community/support/${id}`,

  event: (id: string) => `/community/event/${id}`,

  feed: () => "/community",

  share: () => "/community/share",
};