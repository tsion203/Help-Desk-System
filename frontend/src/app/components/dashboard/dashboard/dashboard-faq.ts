export interface DashboardFaqCategory {
  name: string;
  items: {
    question: string;
    steps: string[];
    escalation?: string;
  }[];
}

export const DASHBOARD_FAQ: DashboardFaqCategory[] = [
  {
    name: 'Common Computer Problems',
    items: [
      {
        question: 'My computer is slow.',
        steps: [
          'Save your work, then close unused applications and browser tabs.',
          'Allow any visible, approved updates to finish. Do not interrupt them.',
          'If no transaction or update is running, restart normally from the system menu and reopen only what you need.',
        ],
        escalation:
          'Create a ticket if it remains slow after one restart or keeps happening. Do not delete company files or install cleanup tools.',
      },
      {
        question: 'My computer or application is frozen.',
        steps: [
          'Wait briefly and avoid repeated clicks, especially while a transaction is processing.',
          'If other applications respond, save work in them. Close and reopen the affected application normally only if no transaction is pending.',
          'If the system menu responds, restart normally only after saving work and confirming no transaction or update is running.',
        ],
        escalation:
          'Stop and create a ticket if the device remains frozen, work cannot be saved, or a transaction outcome is uncertain. Do not force shutdown, unplug the device, or resubmit a transaction.',
      },
      {
        question: 'My printer is not working.',
        steps: [
          'Check that the printer is powered on, has paper, and shows no warning. Check accessible power and network or USB cables without opening equipment.',
          'Check that you selected the correct approved printer and are connected to the company network.',
          'Read the printer display and check your print queue before sending another copy. Use the approved secure print release process if required.',
        ],
        escalation:
          "Create a ticket if it still will not print or reports a jam or hardware error. Do not change drivers, clear other users' jobs, or send confidential documents to an unapproved printer.",
      },
    ],
  },
  {
    name: 'Network & Internet',
    items: [
      {
        question: 'I cannot connect to the network/internet.',
        steps: [
          "Check your device's network indicator and that its network cable is securely connected, or select the approved company Wi-Fi network.",
          'Try a known, approved internal site and another approved site to see whether only one service is affected.',
          'If working remotely, check the approved VPN connection using your normal company procedure. If safe to do so, save work and restart your device once.',
        ],
        escalation:
          'Create a ticket if connectivity is still unavailable. If you cannot access Help Desk, use your established internal support contact. Do not change DNS, proxy, firewall, or router settings or use a personal hotspot to bypass controls.',
      },
    ],
  },
  {
    name: 'Email',
    items: [
      {
        question: 'My email is not sending or receiving messages.',
        steps: [
          'Check your company network connection and any offline or connection message in the email application.',
          'Check the recipient address, Outbox, and any delivery failure notice. Check Junk for expected messages without opening suspicious links or attachments.',
          'Save drafts, then close and reopen the email application normally. Check for a mailbox-full or attachment-size warning.',
        ],
        escalation:
          'Create a ticket if email still fails, including the time and a non-sensitive error message. Do not delete business records to free space, forward work mail to personal accounts, or repeatedly resend messages.',
      },
    ],
  },
  {
    name: 'Applications',
    items: [
      {
        question: 'My application is not responding.',
        steps: [
          'Wait briefly for the application to finish processing; avoid repeated clicks.',
          'Check the network connection if the application needs it, and save any work that is still accessible.',
          'If no transaction is pending, close the application normally and reopen it once. If necessary, restart the device normally after saving work.',
        ],
        escalation:
          'Create a ticket if it still does not respond or cannot close normally. Stop immediately if a banking transaction may be pending; do not force-stop the application or submit it again.',
      },
      {
        question: 'An application is showing an error.',
        steps: [
          'Note the error message or code, the time, and what you were doing. Capture a screenshot only if it excludes confidential information.',
          'Check your network connection and confirm you are using the approved application and your own account.',
          'For a non-transaction task, save work and close and reopen the application once.',
        ],
        escalation:
          'Create a ticket if the error returns. For transaction, security, or data-integrity errors, stop immediately and contact support through the established process. Do not reinstall software, change settings, or repeat a transaction with an unknown outcome.',
      },
    ],
  },
  {
    name: 'Account & Login',
    items: [
      {
        question: 'I cannot log in.',
        steps: [
          'Confirm you are on the approved sign-in page and connected to the required company network or VPN.',
          'Check your work email or username, keyboard layout, and Caps Lock before carefully entering your credentials.',
          'If you forgot your password, use the approved password reset process instead of guessing repeatedly. Only approve an MFA request you initiated.',
        ],
        escalation:
          "Stop if your account is locked, access is denied, or sign-in still fails. Create a ticket if you can access Help Desk; otherwise use your established internal support contact. Never share passwords or MFA codes or use another person's account.",
      },
      {
        question: 'I forgot my password.',
        steps: [
          'For Help Desk, select Forgot password on the sign-in page, enter your work email, and select Send reset link.',
          'Follow the reset link you requested in your work email. For other company systems, use their approved password reset process.',
          'Return to the approved sign-in page and sign in with your new password. Never include passwords or reset links in a ticket.',
        ],
        escalation:
          'If the reset email does not arrive, the link fails, or you cannot access work email, contact your established internal support channel. Create a ticket if Help Desk is still accessible.',
      },
    ],
  },
  {
    name: 'Help Desk / Tickets',
    items: [
      {
        question: 'When should I create a support ticket?',
        steps: [
          'Create a ticket when the safe steps above do not fix the issue, it recurs, or you need access or assistance from support.',
          'Stop troubleshooting immediately for suspected security incidents, possible data loss, or an uncertain banking transaction. Use the established urgent incident process as well as Help Desk; do not wait for a ticket response.',
          'Check your existing tickets first. Add an update to an existing ticket for the same issue instead of creating duplicates.',
        ],
      },
      {
        question: 'How do I create a ticket?',
        steps: [
          'Select Create ticket below.',
          'Enter a clear Subject, select a Category and Priority that reflect the impact, and fill in the Description.',
          'Describe what happened, when it started, the affected device or application, and the troubleshooting already tried. Include only non-sensitive error details.',
          'Select Create ticket to submit. Add any permitted attachments from the ticket details afterwards.',
        ],
      },
      {
        question: 'How can I check my ticket status?',
        steps: [
          'Select My tickets below or open a ticket from Recent Ticket Activity on this dashboard.',
          'Open the relevant ticket to see its current status and comments from support.',
          'Select Status History in the ticket details to see when its status changed.',
        ],
      },
      {
        question: 'How do I add a comment or attachment to my ticket?',
        steps: [
          'Open your ticket. In Comments, enter an update and select Send comment.',
          'For a file, select Attachments, then Choose file, and select Upload. Wait for the success message.',
          'Only share information permitted by company policy. Remove customer, account, and other confidential data from screenshots; never attach passwords, MFA codes, or reset links.',
          'Closed tickets are read-only. If your issue remains unresolved, use Update status to reopen your ticket before adding an update.',
        ],
      },
      {
        question: 'What do the different ticket statuses mean?',
        steps: [
          'OPEN: The ticket has been created and is awaiting handling.',
          'ASSIGNED: A support officer has been assigned to the ticket.',
          'IN PROGRESS: Support is working on the issue.',
          'PENDING: Work is waiting for information or another action. Check comments for any request from support.',
          'RESOLVED: Support has provided a resolution. Check that the issue is fixed.',
          'CLOSED: The ticket is complete and its content is read-only.',
          'REOPENED: A closed ticket has been opened again because more help is needed.',
        ],
      },
    ],
  },
];
