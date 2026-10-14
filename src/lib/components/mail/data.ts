export type MailReply = {
    name: string;
    email: string;
    date: string;
    body: string;
};

export type Mail = {
    name: string;
    email: string;
    subject: string;
    date: string;
    teaser: string;
    body: string;
    unread?: boolean;
    replies?: MailReply[];
};

export const mails: Mail[] = [
    {
        name: "William Smith",
        email: "williamsmith@example.com",
        subject: "Meeting Tomorrow",
        date: "09:34 AM",
        teaser: "Hi team, just a reminder about our meeting tomorrow at 10 AM.\nPlease come prepared with your project updates.",
        body: "Hi team,\n\nJust a reminder about our meeting tomorrow at 10 AM in Conference Room B.\n\nPlease come prepared with your project updates, current blockers, and goals for next week. I've attached the agenda — let me know if there's anything you'd like to add.\n\nLooking forward to seeing you all there!\n\nBest,\nWilliam",
        unread: true,
        replies: [
            {
                name: "shadcn",
                email: "m@example.com",
                date: "09:12 AM",
                body: "Thanks for the reminder, William!\n\nI'll bring the updated timeline for the onboarding flow. Can we also add 5 mins to discuss the launch checklist?\n\nSee you tomorrow!",
            },
            {
                name: "William Smith",
                email: "williamsmith@example.com",
                date: "09:34 AM",
                body: "Absolutely — just added it to the agenda.\n\nI shared the doc link in the invite. Let me know if you can't access it.",
            },
        ],
    },
    {
        name: "Alice Smith",
        email: "alicesmith@example.com",
        subject: "Re: Project Update",
        date: "Yesterday",
        teaser: "Thanks for the update. The progress looks great so far.\nLet's schedule a call to discuss the next steps.",
        body: "Hi there,\n\nThanks for the update. The progress looks great so far — especially the new onboarding flow.\n\nLet's schedule a call to discuss the next steps. Are you free Thursday afternoon? I want to go over timelines and make sure we're aligned on the launch checklist.\n\nThanks!\nAlice",
        unread: true,
        replies: [
            {
                name: "shadcn",
                email: "m@example.com",
                date: "Yesterday",
                body: "Hi Alice,\n\nThursday afternoon works for me — how's 2:30 PM?\n\nI'll bring the latest metrics and the open questions on scope.",
            },
            {
                name: "Alice Smith",
                email: "alicesmith@example.com",
                date: "Yesterday",
                body: "Perfect, 2:30 PM it is. Invite sent!\n\nNo need to prep slides, a quick walkthrough of the demo will be enough.",
            },
        ],
    },
    {
        name: "Bob Johnson",
        email: "bobjohnson@example.com",
        subject: "Weekend Plans",
        date: "2 days ago",
        teaser: "Hey everyone! I'm thinking of organizing a team outing this weekend.\nWould you be interested in a hiking trip or a beach day?",
        body: "Hey everyone!\n\nI'm thinking of organizing a team outing this weekend to celebrate the release.\n\nWould you be interested in a hiking trip or a beach day? Reply with your vote:\n\n1. Hiking at Bear Mountain (Saturday 9 AM)\n2. Beach day at Rockaway (Sunday 11 AM)\n\nI'll book everything once we have a majority.\n\nCheers,\nBob",
        unread: true,
        replies: [
            {
                name: "Emily Davis",
                email: "emilydavis@example.com",
                date: "2 days ago",
                body: "Voting for hiking! 🥾\n\nHaven't been to Bear Mountain in ages. I can drive and take 3 people if needed.",
            },
            {
                name: "shadcn",
                email: "m@example.com",
                date: "2 days ago",
                body: "Hiking gets my vote too — Sunday beach forecast looks rainy anyway.\n\nHappy to bring snacks for the trail.",
            },
            {
                name: "Bob Johnson",
                email: "bobjohnson@example.com",
                date: "2 days ago",
                body: "Hiking it is! Majority wins.\n\nI'll book the trail permits and send details tonight. Thanks all!",
            },
        ],
    },
    {
        name: "Emily Davis",
        email: "emilydavis@example.com",
        subject: "Re: Question about Budget",
        date: "2 days ago",
        teaser: "I've reviewed the budget numbers you sent over.\nCan we set up a quick call to discuss some potential adjustments?",
        body: "Hi,\n\nI've reviewed the budget numbers you sent over for Q4.\n\nOverall we're in good shape, but I think we need to adjust the spend on tooling and contractors. Can we set up a quick call to discuss some potential adjustments?\n\nI've left comments in the spreadsheet — let me know what you think.\n\nThanks,\nEmily",
        unread: false,
    },
    {
        name: "Michael Wilson",
        email: "michaelwilson@example.com",
        subject: "Important Announcement",
        date: "1 week ago",
        teaser: "Please join us for an all-hands meeting this Friday at 3 PM.\nWe have some exciting news to share about the company's future.",
        body: "Hello all,\n\nPlease join us for an all-hands meeting this Friday at 3 PM in the main auditorium (and on Zoom).\n\nWe have some exciting news to share about the company's future, including updates on our roadmap and growth plans.\n\nAttendance is encouraged — recording will be shared afterwards.\n\nBest,\nMichael",
        unread: false,
    },
    {
        name: "Sarah Brown",
        email: "sarahbrown@example.com",
        subject: "Re: Feedback on Proposal",
        date: "1 week ago",
        teaser: "Thank you for sending over the proposal. I've reviewed it and have some thoughts.\nCould we schedule a meeting to discuss my feedback in detail?",
        body: "Hi,\n\nThank you for sending over the proposal. I've reviewed it and have some thoughts on scope and pricing.\n\nOverall the direction is solid, but I'd like to tighten up section 2 and clarify deliverables. Could we schedule a meeting to discuss my feedback in detail?\n\nHow's Wednesday at 2 PM?\n\nThanks,\nSarah",
        unread: false,
        replies: [
            {
                name: "shadcn",
                email: "m@example.com",
                date: "1 week ago",
                body: "Hi Sarah,\n\nWednesday at 2 PM works great. I'll bring a revised version of section 2 with clearer deliverables.\n\nThanks for the quick review!",
            },
        ],
    },
    {
        name: "David Lee",
        email: "davidlee@example.com",
        subject: "New Project Idea",
        date: "1 week ago",
        teaser: "I've been brainstorming and came up with an interesting project concept.\nDo you have time this week to discuss its potential impact and feasibility?",
        body: "Hey,\n\nI've been brainstorming and came up with an interesting project concept around automated triage for support tickets.\n\nI put together a one-pager with the problem, proposed solution, and rough effort estimate. Do you have time this week to discuss its potential impact and feasibility?\n\nLet me know what slot works for you.\n\n— David",
        unread: false,
    },
    {
        name: "Olivia Wilson",
        email: "oliviawilson@example.com",
        subject: "Vacation Plans",
        date: "1 week ago",
        teaser: "Just a heads up that I'll be taking a two-week vacation next month.\nI'll make sure all my projects are up to date before I leave.",
        body: "Hi team,\n\nJust a heads up that I'll be taking a two-week vacation next month, from the 12th to the 26th.\n\nI'll make sure all my projects are up to date before I leave, and I'll share a handoff doc with open items and contacts.\n\nLet me know if there's anything urgent I should wrap up before then.\n\nThanks!\nOlivia",
        unread: false,
    },
    {
        name: "James Martin",
        email: "jamesmartin@example.com",
        subject: "Re: Conference Registration",
        date: "1 week ago",
        teaser: "I've completed the registration for the upcoming tech conference.\nLet me know if you need any additional information from my end.",
        body: "Hi,\n\nI've completed the registration for the upcoming tech conference. We're confirmed for 3 passes, including the workshop day.\n\nLet me know if you need any additional information from my end — hotel block closes Friday, so please confirm if you're attending.\n\nThanks,\nJames",
        unread: false,
    },
    {
        name: "Sophia White",
        email: "sophiawhite@example.com",
        subject: "Team Dinner",
        date: "1 week ago",
        teaser: "To celebrate our recent project success, I'd like to organize a team dinner.\nAre you available next Friday evening? Please let me know your preferences.",
        body: "Hello!\n\nTo celebrate our recent project success, I'd like to organize a team dinner next Friday evening at 7 PM.\n\nI'm looking at a few spots downtown — are you available? Please let me know your preferences and any dietary restrictions.\n\nCan't wait to celebrate together!\n\nBest,\nSophia",
        unread: false,
    },
];
