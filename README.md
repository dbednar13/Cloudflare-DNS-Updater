# Overview

This project started to address a personal need. I owed domains through Google Domains and with the help of DDClient used them as a DDNS to my house. This worked well until Google sold off its domain service to Squarespace. At that point I moved my domains to Cloudflare. For most people that's not too big of a deal, but I was running a Windows server, and the latest Windows build did not support Cloudflare's new API key authentication. With the absence of other set-and-forget tools, I needed to create my own.

This is the result of my efforts. We use the Cloudflare API to manage our updates for us, and assumes all needed domains & sub domains are already defined within Cloudflare.

# Prerequisites

- [Node](https://nodejs.org/en/download)
  - Any version should work
  - Developed against Node 20.10.0
- Permissions to set schedules (optional)

# Setup

- Download or checkout the project to your desired location.
- Using your terminal of choice, navigate to the code and run `npm i`
- Populate the following in the dns.js file
  - AUTH_EMAIL with the email address associated with Cloudforge
  - AUTH_TOKEN with your Cloudforge API key
  - ZONE_IDS with a list of all zones the you wish to monitor

# Running

- Using a terminal, run "node dns.js"

# Future updates

- Add ability to create a new sub-domain in existing zones

# Legal Stuff

It is the responsibility of the end user to know and understand the terms of using Cloudflare's API. The writer of this script will not be held responsible for any abuse or misuse of the Cloudflare API.
