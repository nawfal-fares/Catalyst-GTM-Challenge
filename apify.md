// Root: array of activity items. Each item is one of three types: "reaction", "comment", or "post"
[
  // ============================================================
  // TYPE 1: REACTION OBJECT (someone liked/reacted to a post)
  // ============================================================
  {
    "type": "reaction",                          // discriminator: marks this as a reaction record
    "id": "urn:li:fsd_reaction:(...)",            // unique LinkedIn URN for this specific reaction
    "reactionType": "LIKE",                       // kind of reaction: LIKE | EMPATHY | PRAISE | APPRECIATION | INTEREST
    "actor": {                                    // the person/company who reacted
      "id": "string",                             // LinkedIn internal profile/company ID
      "name": "string",                           // display name of the actor
      "linkedinUrl": "string",                    // URL to actor's LinkedIn profile/page
      "position": "string",                       // actor's job title / bio headline (or follower count if a company page)
      "pictureUrl": "string",                     // OPTIONAL — direct URL to profile picture (absent for some actors)
      "picture": {                                // OPTIONAL — structured picture object (absent for some actors)
        "url": "string",                          // same image URL as pictureUrl
        "width": 800,                             // image width in pixels
        "height": 800                             // image height in pixels
      }
    },
    "postId": "string",                           // ID of the post this reaction belongs to
    "query": {                                    // metadata about how this record was fetched
      "post": "string"                            // the original post URL that was queried/scraped
    }
  },

  // ============================================================
  // TYPE 2: COMMENT OBJECT (someone commented on a post)
  // ============================================================
  {
    "type": "comment",                            // discriminator: marks this as a comment record
    "id": "string",                               // unique numeric ID for this comment
    "linkedinUrl": "string",                      // deep link to this exact comment on LinkedIn
    "commentary": "string",                       // the actual text content of the comment
    "commentaryAttributes": [                     // array of rich-text annotations within the commentary text (e.g. @mentions)
      {
        "start": 0,                               // character index where the mention/tag starts in "commentary"
        "length": 10,                             // number of characters the mention/tag spans
        "type": "PROFILE_MENTION",                // type of annotation: PROFILE_MENTION | COMPANY_NAME
        "hyperlink": null,                        // optional custom hyperlink (usually null)
        "textLink": null,                         // optional custom text link (usually null)
        "profile": {                              // present only when type = PROFILE_MENTION
          "id": "string",                         // mentioned person's LinkedIn ID
          "firstName": "string",                  // mentioned person's first name
          "lastName": "string",                   // mentioned person's last name
          "linkedinUrl": "string",                // mentioned person's profile URL
          "publicIdentifier": "string"             // mentioned person's URL slug/handle
        },
        "company": {                              // present only when type = COMPANY_NAME
          "id": "string",                         // mentioned company's LinkedIn ID
          "name": "string",                       // mentioned company's display name
          "linkedinUrl": "string"                 // mentioned company's page URL
        }
      }
    ],
    "createdAt": "2026-06-14T22:45:07.259Z",       // ISO-8601 timestamp when comment was posted
    "createdAtTimestamp": 1781477107259,           // same timestamp as Unix epoch milliseconds
    "engagement": {                                // engagement stats on this comment itself
      "likes": 0,                                  // total like count on the comment
      "comments": 0,                               // total reply count on the comment
      "shares": 0,                                 // total share count on the comment
      "reactions": [                               // breakdown of reaction types on the comment
        {
          "type": "LIKE",                          // reaction type
          "count": 2                               // how many of this reaction type
        }
      ]
    },
    "pinned": false,                               // whether the post author pinned this comment
    "contributed": false,                          // whether this was a "contribution" (LinkedIn collaborative articles feature)
    "edited": false,                                // whether the comment was edited after posting
    "actor": {                                     // the person who wrote the comment
      "id": "string",                              // LinkedIn internal profile ID
      "type": "profile",                           // always "profile" for comment authors
      "name": "string",                            // commenter's display name
      "linkedinUrl": "string",                     // commenter's profile URL
      "position": "string",                        // commenter's job title / headline
      "pictureUrl": "string",                      // direct URL to commenter's profile picture
      "picture": {                                 // structured picture object
        "url": "string",                           // image URL
        "width": 800,                              // width in pixels
        "height": 800                              // height in pixels
      },
      "author": false                              // true if this commenter is also the original post's author
    },
    "replies": [                                   // OPTIONAL array of nested replies to this comment
      {
        "id": "string",                            // reply's unique ID
        "linkedinUrl": "string",                   // deep link to the reply
        "commentary": "string",                    // reply text
        "commentaryAttributes": [],                // same shape as parent's commentaryAttributes
        "createdAt": "string",                     // ISO timestamp
        "createdAtTimestamp": 0,                   // epoch ms timestamp
        "engagement": {                            // same engagement shape as above
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "reactions": []
        },
        "postId": "string",                        // (note: replies carry postId instead of being implicit)
        "pinned": false,                           // same as parent
        "contributed": false,                      // same as parent
        "edited": false,                           // same as parent
        "actor": { "...": "same actor shape as parent comment's actor" } // who wrote the reply
      }
    ],
    "postId": "string",                            // ID of the post this comment was made on
    "query": {                                     // metadata about how this record was fetched
      "post": "string"                             // original post URL queried/scraped
    }
  },

  // ============================================================
  // TYPE 3: POST OBJECT (the original LinkedIn post itself)
  // ============================================================
  {
    "type": "post",                                // discriminator: marks this as the original post record
    "id": "string",                                // unique ID for this post (often differs from entityId)
    "linkedinUrl": "string",                       // full URL to view the post on LinkedIn
    "content": "string",                           // full text body of the post
    "contentAttributes": [                          // rich-text annotations within "content" (same shape as commentaryAttributes)
      {
        "start": 11,                               // character offset where annotation begins
        "length": 6,                               // length of the annotated span
        "type": "COMPANY_NAME",                    // COMPANY_NAME | PROFILE_MENTION
        "hyperlink": null,                         // usually null
        "textLink": null,                          // usually null
        "company": { "id": "string", "name": "string", "linkedinUrl": "string" }, // if type=COMPANY_NAME
        "profile": { "id": "string", "firstName": "string", "lastName": "string", "linkedinUrl": "string", "publicIdentifier": "string" } // if type=PROFILE_MENTION
      }
    ],
    "author": {                                    // who wrote/posted this
      "id": "string",                              // LinkedIn internal profile ID
      "universalName": null,                       // legacy LinkedIn vanity-name field (usually null now)
      "publicIdentifier": "string",                // URL slug/handle (e.g. "willleatherman")
      "type": "profile",                           // always "profile" for post authors
      "name": "string",                            // author's display name
      "linkedinUrl": "string",                     // author's profile URL
      "info": "string",                            // author's short headline/bio
      "website": "string",                         // OPTIONAL — link in author's profile (e.g. booking page)
      "websiteLabel": "string",                    // OPTIONAL — display label for the website link
      "avatar": {                                  // author's profile picture
        "url": "string",                           // image URL
        "width": 348,                              // width in pixels
        "height": 348                              // height in pixels
      },
      "urn": "string"                              // author's numeric LinkedIn URN/ID
    },
    "postedAt": {                                  // when the post was originally published
      "timestamp": 1781820253568,                  // epoch ms timestamp
      "date": "2026-06-18T22:04:13.568Z",          // ISO-8601 timestamp
      "postedAgoShort": "1w",                      // short relative time string ("1w", "4d", etc.)
      "postedAgoText": "string"                    // full relative time + visibility text (e.g. "1 week ago • Visible to anyone on or off LinkedIn")
    },
    "postImages": [                                // array of images attached to the post (empty if none)
      {
        "url": "string",                           // image URL (often high-res CDN link)
        "width": 2048,                              // image width in pixels
        "height": 1536                              // image height in pixels
      }
    ],
    "article": {                                   // OPTIONAL — present if post links to a LinkedIn newsletter/article
      "title": "string",                           // article headline
      "subtitle": "string",                        // usually the author's name
      "link": "string",                            // URL to the full article
      "linkLabel": "string",                       // accessible label describing the link + read time
      "description": "string",                     // short preview/snippet of article body
      "image": {                                   // article's cover image
        "url": "string",                           // image URL
        "width": 960,                              // width in pixels
        "height": 540                              // height in pixels
      }
    },
    "newsletterUrl": "string",                     // OPTIONAL — URL of the newsletter series this post belongs to
    "newsletterTitle": "string",                   // OPTIONAL — display name of the newsletter (e.g. "Catalyst")
    "repostedBy": {                                // OPTIONAL — present if this post appears because someone reposted it
      "name": "string",                            // reposter's display name
      "publicIdentifier": "string",                // reposter's URL slug
      "universalName": null,                       // legacy field, usually null
      "linkedinUrl": "string"                      // reposter's profile URL
    },
    "repostedAt": {                                // OPTIONAL — timestamp of the repost action
      "timestamp": 1781820253568,                  // epoch ms
      "date": "string"                             // ISO-8601 timestamp
    },
    "socialContent": {                             // UI/visibility flags controlling how engagement is displayed
      "hideCommentsCount": false,                  // whether comment count is hidden in UI
      "hideReactionsCount": false,                 // whether reaction count is hidden
      "hideSocialActivityCounts": false,            // whether all activity counts are hidden
      "hideShareAction": true,                     // whether the "share" button is hidden
      "hideSendAction": true,                      // whether the "send" (DM) button is hidden
      "hideRepostsCount": false,                   // whether repost count is hidden
      "hideViewsCount": false,                     // whether view count is hidden
      "trustInterventionBanner": null,             // LinkedIn misinformation/trust banner, if any (usually null)
      "hideReactAction": false,                    // whether the react button is disabled
      "hideCommentAction": false,                  // whether the comment button is disabled
      "shareUrl": "string",                        // shareable URL for this post
      "showContributionExperience": false,          // whether collaborative-article contribution UI is shown
      "showSocialDetail": true                     // whether engagement detail panel is shown
    },
    "header": {                                    // metadata shown above the post (e.g. "X reposted this")
      "image": {                                   // OPTIONAL — icon/avatar shown in the header
        "url": "string",                           // image URL
        "width": 348,                               // width in pixels
        "height": 348                               // height in pixels
      },
      "linkedinUrl": "string",                     // OPTIONAL — link target for the header
      "imageLink": "string",                       // OPTIONAL — link target when clicking the header image
      "text": "string"                              // header caption text (e.g. "Will Leatherman reposted this"), or null if no header
    },
    "entityId": "string",                          // LinkedIn's internal entity/activity ID for this post
    "shareUrn": "string",                          // URN of the underlying share/ugcPost object
    "shareLinkedinUrl": "string",                  // canonical feed-update URL for the underlying share
    "engagement": {                                // aggregate engagement stats for the whole post
      "id": "string",                              // ID the engagement stats are tied to (matches shareUrn's post)
      "likes": 42,                                 // total like count
      "comments": 5,                               // total comment count
      "shares": 4,                                 // total share/repost count
      "reactions": [                                // breakdown by reaction type
        { "type": "LIKE", "count": 33 },            // count of LIKE reactions
        { "type": "EMPATHY", "count": 6 },          // count of EMPATHY reactions
        { "type": "PRAISE", "count": 1 },           // count of PRAISE reactions
        { "type": "APPRECIATION", "count": 1 },     // count of APPRECIATION reactions
        { "type": "INTEREST", "count": 1 }          // count of INTEREST reactions
      ]
    },
    "reactionIds": [                               // flat list of all reaction URNs on this post (cross-references "reaction" type records above)
      "urn:li:fsd_reaction:(...)"
    ],
    "commentIds": [                                // flat list of all comment IDs on this post (cross-references "comment" type records above)
      "string"
    ],
    "query": {                                     // metadata about how this post record was fetched
      "sortBy": "date",                            // sort order used when scraping (e.g. by date)
      "page": "1",                                 // pagination page number of the fetch
      "targetUrl": "string",                       // the profile URL being scraped (e.g. the LinkedIn profile feed)
      "sessionId": "string"                        // unique session ID for this scrape run
    }
  }
]