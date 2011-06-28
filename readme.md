<H1>FDC-NODEJS-HEROKU</H1>
I think I need to start getting better names for my projects.
<HR />
<P>Anyway.</P>

<P>
This is a sample project similar to NodeJS-RESTFDC (see, I'm not only boring - I'm inconsistent) but has been completely refactored
to use with Heroku as the deployment platform.  It is also better suited for juggling between a local instance, where you will need 
to have SSL setup with Node.js, and Heroku by detecting if the server port is being set for you (which would be the case for Heroku).
NodeJS-RESTFDC is probably not going to get updated now that this project handles both Heroku and non-Heroku settings.
</P>

<P>
There are two main modules: rest and oauth.  The OAuth is designed specific to how Force.com sets up the Remote Access, but we're 
very similar to other OAuth2 implementations out there.  If you are still trying get OAuth1 up and running - sorry about that.  The REST
module is also geared specific to the Force.com REST API and even includes support for custom Apex REST endpoints.</P>

<P>
This current example uses another project, snip - but that has another repo now.  Snip is just server-side includes, just easier to build out 
some demo pages with it.  Not really needed for other implementations, obviously.
</P>

<P>
<B>Recent Updates:</B>
<HR />
Refresh loop appears to be working well.  When a call fails due to an invalid session, it gets put into an array and the refresh token is 
attempted to get a new access token.  Probably needs a second fail condition which will simply produce an error.  I've also moved most of the routing
functionality into the rest module itself, and updated that module so that you can make more specific calls into it with callbacks if needed.  
This might be handy if there's an instance where you aren't trying to route like a proxy, but need to hit FDC for the server-side application 
to do some data work.  I'll probably try to edge that into an example somewhere, possibly when I do a proper template demo.
<BR /><BR />
The oauth and rest modules will probably be merged in the near future for one proper NPM'able package.  Then I'll include or update hooks into the 
rest portions if you want to use a different OAuth module.  Force.com's OAuth implementation is pretty specific, so having the internal one will 
ease the path for developers, but a different OAuth project down the road might have better functionality than want is being presented here.
</P>

<P>
Catching me on twitter @joshbirk is probably the most efficient mode of communication, but please fork, comment and send issues without
mercy.</P>