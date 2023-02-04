# Was It Here Bot

Have you ever had an argument in the chat that this meme was already there? Have you being annoyed abd frustrated when someone don't remember all those details? Don't worry, I got you! With help of this bot you easily will prove someones wrong(or not :rofl:).

### Commands:
- `/bayan` - reply to an image you want to check with this command and it will be checked against all data you had before  

### Setup:
1. Create your bot in the **@BotFather**. Find it in the telegram and follow the prompts to create your own bot. You need to take generate a token for your bot and save it to `BOT_TOKEN` in the `.env` file. 
2. Add user to a group/supergroup and make sure it has Admin access rights. Otherwise, it won't be able to read all conversation in order to find images and save it's' metadata in order to use it further.
3. Install [ngrok](https://ngrok.com/) for web hook setup.
    ```
    npm install ngrok -g
    ```
4. Set `EXPRESS_PORT` to the desired value whichever you have available(e.g. 3000).
5. Establish the session with selected port for [expressjs](https://expressjs.com/en/starter/installing.html)
    ```
    ngrok http 3000
    ```
    Take HTTPS url from the forwarding (e.g. `https://000-00-000-00-00.ngrok.io`) and set it to `APPLICATION_URL` variable.
6. Create an account in [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register?utm_content=rlsapostreg&utm_source=google&utm_campaign=search_gs_pl_evergreen_atlas_general_retarget-brand-postreg_gic-null_emea-all_ps-all_desktop_eng_lead&utm_term=&utm_medium=cpc_paid_search&utm_ad=&utm_ad_campaign_id=14412646473&adgroup=131761130372&cq_cmp=14412646473&gclid=Cj0KCQiAofieBhDXARIsAHTTldpdTMkLsgACviMpiMz-67LuW34RTFa3Vlpcquk7XTVIrhVfFNttW1YaAmz2EALw_wcB). Free tier is more than enough.
7. Create a **Cluster**. You can use defaults. 
8. You will be prompt to a **Quickstart**. Use Username and Password. Put those also into the `DB_USERNAME` and `DB_PASSWORD` respectively.
9. **Where would you like to connect from?** - be sure to add your IP or IP of the machine you're deploying bot to.
10. You will be prompt to Database Deployments. Click on Cluster0 > Connect > Connect your application. You'll see this:
    ```
    mongodb+srv://youruser:<password>@cluster0.xxxxxxx.mongodb.net/?retryWrites=true&w=majority
    ```
    Pick *cluster0.xxxxxxx* and put it into the variable `DB_CLUSTER_ID`.
    Setup is complete. On bot startup the **Database** and the **Collection** will be created automatically. If you want to change it, go to environment variables and pick your own names for those and still they will be added automatically.
    * DB_NAME - Database
    * DB_COLLECTION - Collection
11. `npm install`
12. `npm start`

And that's it! Thank you for your time!
