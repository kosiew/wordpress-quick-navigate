// ==UserScript==
// @name         WordPress Quick Navigate
// @namespace    https://wpcomhappy.wordpress.com/
// @icon         https://raw.githubusercontent.com/soufianesakhi/feedly-filtering-and-sorting/master/web-ext/icons/128.png
// @version      0.291
// @description  WordPress Quick Navigate
// @author       Siew "@xizun"
// @match        https://*/*
// @grant        GM_setClipboard
// @require      http://code.jquery.com/jquery-3.4.1.min.js
// @require      http://code.jquery.com/ui/1.12.1/jquery-ui.js
// @require      https://unpkg.com/vue@2.6.12/dist/vue.min.js
// @require      https://unpkg.com/vue-select@3.11.2/dist/vue-select.js
// @require      https://unpkg.com/vue-swal
// @resource     IMPORTED_CSS https://unpkg.com/vue-select@3.11.2/dist/vue-select.css
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function($){ //function to create private scope with $ parameter
// @updateURL    https://github.com/Automattic/support-helper-tools/raw/main/miscellaneous/WordPressQuickNavigate.user.js
    const options = {
        DEBUG: true,
        ADD_MISSING_URLS: false
    };
    let domain;

    let loadedQuickNavigate = false;

    const WP_ADMIN = 'wp-admin',
        WP_LOGIN = 'wp-login.php',
        LOCALHOST = 'localhost',
        VAR_DOMAIN = '{var:domain}',
        VAR_ID = '{var:id}',
        ITEMS = 'items',
        DELETE = 'DELETE',
        EDIT = 'EDIT',
        ADD = 'ADD',
        LOAD = 'LOAD',
        INVALID_ID = -9999,
        MAX_PATHS = 10;

    const EXCLUDE_DOMAINS = [
        'hud.happychat.io',
        'schedule.happy.tools',
        'klausapp.com'
    ];


    // json from Alfred Quick Navigate's paths.json
    const JSON = {
        "items": [
            {
                url: "https://wordpress.com/activity-log/{var:domain}",
                title: "calypso Activity Log"
            },
            {
                url: "https://wordpress.com/domains/add/{var:domain}",
                title: "calypso Add Domain"
            },
            {
                url: "https://wordpress.com/comments/all/{var:domain}",
                title: "calypso Comments"
            },
            {
                url: "https://wordpress.com/customize/{var:domain}",
                title: "calypso Customizer"
            },
            {
                url: "https://wordpress.com/earn/ads-earnings/{var:domain}",
                title: "calypso Earnings"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=feedback&calypsoify=0",
                title: "calypso Feedback"
            },
            {
                url: "https://mail.google.com/a/{var:domain}",
                title: "calypso G Suite Login"
            },
            {
                url: "https://wordpress.com/settings/general/{var:domain}",
                title: "calypso General Settings"
            },
            {
                url: "https://wordpress.com/import/{var:domain}",
                title: "calypso Importer"
            },
            {
                url: "https://wordpress.com/domains/manage/{var:domain}",
                title: "calypso Manage Domains"
            },
            {
                url: "https://wordpress.com/marketing/connections/{var:domain}",
                title: "calypso Marketing > Connections Publicize"
            },
            {
                url: "https://wordpress.com/marketing/sharing-buttons/{var:domain}",
                title: "calypso Marketing > Sharing buttons"
            },
            {
                url: "https://wordpress.com/marketing/traffic/{var:domain}",
                title: "calypso Marketing > Traffic page title structure"
            },
            {
                url: "https://wordpress.com/marketing/tools/{var:domain}",
                title: "calypso Marketing"
            },
            {
                url: "https://wordpress.com/media/{var:domain}",
                title: "calypso Media"
            },
            {
                url: "https://wordpress.com/menus/{var:domain}",
                title: "calypso Menus"
            },
            {
                url: "https://wordpress.com/pages/{var:domain}",
                title: "calypso Pages"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/add-support-session",
                title: "calypso Paid Support Session"
            },
            {
                url: "https://wordpress.com/people/team/{var:domain}",
                title: "calypso People. invite team"
            },
            {
                url: "https://wordpress.com/plans/my-plan/{var:domain}",
                title: "calypso Plans"
            },
            {
                url: "https://wordpress.com/plans/{var:domain}",
                title: "calypso Plans"
            },
            {
                url: "https://wordpress.com/types/jetpack-portfolio/{var:domain}",
                title: "calypso Portfolio"
            },
            {
                url: "https://wordpress.com/posts/my/{var:domain}",
                title: "calypso Posts"
            },
            {
                url: "https://wordpress.com/settings/discussion/{var:domain}",
                title: "calypso Settings > Discussion"
            },
            {
                url: "https://wordpress.com/settings/writing/{var:domain}",
                title: "calypso Settings > Writing.. infinite scroll"
            },
            {
                url: "https://wordpress.com/sharing/{var:domain}",
                title: "calypso Sharing"
            },
            {
                url: "https://wordpress.com/stats/{var:domain}",
                title: "calypso Stats"
            },
            {
                url: "https://wordpress.com/store/{var:domain}",
                title: "calypso Store"
            },
            {
                url: "https://wordpress.com/types/jetpack-testimonial/{var:domain}",
                title: "calypso Testimonial"
            },
            {
                url: "https://wordpress.com/themes/{var:domain}",
                title: "calypso Themes"
            },
            {
                url: "https://{var:domain}/wp-admin/",
                title: "WP-Admin only"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=amp-options",
                title: "wp-admin AMP"
            },
            {
                url: "https://{var:domain}/wp-admin/plugins.php?plugin_status=active",
                title: "wp-admin Active Plugins"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=page",
                title: "wp-admin All Pages"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php",
                title: "wp-admin All Posts"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout",
                title: "wp-admin Checkout"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-comments.php",
                title: "wp-admin Comments"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?s&post_status=all&post_type=product&action=-1&m=0&product_cat&product_type=composite&product_brand&filter_action=Filter&paged=1&action2=-1",
                title: "wp-admin Composites"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=shop_coupon",
                title: "wp-admin Coupons"
            },
            {
                url: "https://{var:domain}/wp-admin/customize.php?return=%2Fwp-admin%2Fthemes.php",
                title: "wp-admin Customize"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status&tab=tools",
                title: "wp-admin Debug"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=delete-blog",
                title: "wp-admin Delete Site"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products",
                title: "wp-admin Display"
            },
            {
                url: "https://{var:domain}/wp-admin/nav-menus.php",
                title: "wp-admin Edit Menus"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=email",
                title: "wp-admin Email"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=wc_shipping_fedex",
                title: "wp-admin FedEx"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=feedback",
                title: "wp-admin Feedback"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?import=tumblr",
                title: "wp-admin Import Tumblr"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/discussion",
                title: "wp-admin Jetpack Discussion"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack_modules",
                title: "wp-admin Jetpack Modules carousel comments likes contact form copy post custom css content types enhanced distribution extra sidebar widgets google analytics gravatar hovercards image cdn infinite scroll json api lazy images markdown mobile theme monitor notifications post by email protect publicize related posts seo tools search secure sign on sharing site stats verification sitemaps subscriptions tiled galleries videopress shortlinks WordPress.com toolbar shortcode embeds"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/performance",
                title: "wp-admin Jetpack Performance"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/security",
                title: "wp-admin Jetpack Security"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/sharing",
                title: "wp-admin Jetpack Sharing"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/traffic",
                title: "wp-admin Jetpack Traffic"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/writing",
                title: "wp-admin Jetpack Writing (including Enable Mobile Theme)"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=jetpack-portfolio",
                title: "wp-admin Jetpack portfolio"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/settings",
                title: "wp-admin Jetpack settings"
            },
            {
                url: "https://{var:domain}/wp-admin/upload.php",
                title: "wp-admin Media"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=page",
                title: "wp-admin New Page"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php",
                title: "wp-admin New Post"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=shop_order",
                title: "wp-admin Order"
            },
            {
                url: "https://{var:domain}/wp-admin/plugins.php",
                title: "wp-admin Plugins"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product",
                title: "wp-admin Products"
            },
            {
                url: "https://{var:domain}/wp-admin/options-discussion.php",
                title: "wp-admin Settings > Discussion Leave a Reply akismet"
            },
            {
                url: "https://{var:domain}/wp-admin/options-media.php",
                title: "wp-admin Settings > Media"
            },
            {
                url: "https://{var:domain}/wp-admin/options-permalink.php",
                title: "wp-admin Settings > Permalinks"
            },
            {
                url: "https://{var:domain}/wp-admin/privacy.php",
                title: "wp-admin Settings > Privacy Policy"
            },
            {
                url: "https://{var:domain}/wp-admin/options-reading.php",
                title: "wp-admin Settings > Reading"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=sharing",
                title: "wp-admin Settings > Sharing"
            },
            {
                url: "https://{var:domain}/wp-admin/options-writing.php",
                title: "wp-admin Settings > Writing enable Markdown"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings",
                title: "wp-admin Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping",
                title: "wp-admin Shipping"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=stats",
                title: "wp-admin Stats"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status",
                title: "wp-admin Status"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=subscriptions",
                title: "wp-admin Sub Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=shop_subscription",
                title: "wp-admin Subscriptions"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=tax",
                title: "wp-admin Tax"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=jetpack-testimonial",
                title: "wp-admin Testimonial"
            },
            {
                url: "https://{var:domain}/wp-admin/themes.php?page=install-required-plugins",
                title: "wp-admin Theme Required Plugins"
            },
            {
                url: "https://{var:domain}/wp-admin/themes.php",
                title: "wp-admin Themes"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php",
                title: "wp-admin Tools"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=ups",
                title: "wp-admin UPS"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=usps",
                title: "wp-admin USPS"
            },
            {
                url: "https://{var:domain}/wp-admin/users.php",
                title: "wp-admin Users"
            },
            {
                url: "https://{var:domain}/wp-admin/widgets.php",
                title: "wp-admin Widgets"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=shop_coupon",
                title: "wp-admin WooCommerce Coupons"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-addons",
                title: "wp-admin WooCommerce Extensions (Addons)"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=shop_order",
                title: "wp-admin WooCommerce Orders"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports",
                title: "wp-admin WooCommerce Reports"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings",
                title: "wp-admin WooCommerce Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status",
                title: "wp-admin WooCommerce Status SSR"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status&tab=tools",
                title: "wp-admin WooCommerce Tools (clear transients"
            },
            {
                url: "https://wordpress.com/people/followers/{var:domain}",
                title: "calypso Followers"
            },
            {
                url: "https://wordpress.com/people/email-followers/{var:domain}",
                title: "calypso Email Followers"
            },
            {
                url: "https://{var:domain}/wp-admin/options-media.php",
                title: "wp-admin Media Settings disable carousel"
            },
            {
                url: "https://wordpress.com/earn/ads-settings/{var:domain}",
                title: "caplypso Earn > Ads settings position"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=category",
                title: "wp-admin Categories"
            },
            {
                url: "https://wordpress.com/plugins/{var:domain}",
                title: "calypso Plugins"
            },
            {
                url: "https://{var:domain}/wp-admin/site-health.php?tab=debug",
                title: "wp-admin site health info"
            },
            {
                url: "https://wordpress.com/settings/general/{var:domain}",
                title: "calypso Settings general timezone language"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check&tab=troubleshoot",
                title: "wp-admin Health Check troubleshooting mode"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check&tab=tools",
                title: "wp-admin health check tools send test mail"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=email_post_changes",
                title: "wp-admin email post changes"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=webhooks",
                title: "wp-admin webhooks"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_status=publish&post_type=post&orderby=title&order=asc",
                title: "wp-admin view posts in alphabetical order"
            },
            {
                url: "https://{var:domain}/wp-admin/index.php?page=wc-setup",
                title: "wp-admin WooCommerce set up wizard"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/traffic",
                title: "wp-admin jetpack ads positions"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=snippets&snippets-safe-mode=true",
                title: "wp-admin Code Snippets safe mode"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=snippets",
                title: "wp-admin Code Snippets"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/writing",
                title: "wp-admin Jetpack Settings Writings - enable Markdown"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?import=wordpress",
                title: "wp-admin Import Wordpress"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=action-scheduler",
                title: "wp-admin Scheduled Actions"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-dashboard",
                title: "wp-admin AutomateWoo dashboard"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=aw_workflow",
                title: "wp-admin AutomateWoo workflows"
            },
            {
                url: "https://wordpress.com/earn/ads-settings/{var:domain}",
                title: "Calypso ad settings update paypal address"
            },
            {
                url: "https://{var:domain}/wp-json/wp/v2/pages",
                title: "wp-json pages"
            },
            {
                url: "https://{var:domain}/wp-json/wp/v2/posts",
                title: "wp-json posts"
            },
            {
                url: "https://{var:domain}/wp-json/wp/v2/categories",
                title: "wp-json categories"
            },
            {
                url: "https://wordpress.com/earn/ads-settings/{var:domain}",
                title: "Calypso Ads settings"
            },
            {
                url: "https://{var:domain}/wp-admin/themes.php?page=mobile-options",
                title: "wp-admin disable mobile theme simple site"
            },
            {
                url: "https://wordpress.com/themes/{var:domain}?s=storefront",
                title: "Calypso storefront theme"
            },
            {
                url: "https://{var:domain}/wp-admin/update-core.php",
                title: "wp-admin WooCommerce update core"
            },
            {
                url: "https://{var:domain}/wp-admin/upload.php?mode=list",
                title: "wp-admin Media Library List view"
            },
            {
                url: "https://{var:domain}/wp-admin/upload.php?mode=list",
                title: "wp-admin media list mode"
            },
            {
                url: "https://wordpress.com/types/wp_block/{var:domain}",
                title: "calypso Manage Reusable Blocks"
            },
            {
                url: "https://wordpress.com/backup/{var:domain}",
                title: "calypso Backup"
            },
            {
                url: "https://wordpress.com/marketing/traffic/{var:domain}",
                title: "Calypso front page meta description org:description"
            },
            {
                url: "https://wordpress.com/me/concierge/{var:domain}/book",
                title: "calypso concierge"
            },
            {
                url: "https://{var:domain}/wp-admin/paid-upgrades.php?page=domains",
                title: "wp-admin domains"
            },
            {
                url: "https://wordpress.com/settings/taxonomies/category/{var:domain}",
                title: "Calypso Categories"
            },
            {
                url: "https://wordpress.com/email/{var:domain}/forwarding/{var:domain}",
                title: "calypso email forward"
            },
            {
                url: "https://wordpress.com/settings/discussion/{var:domain}",
                title: "calypso Discussion - email me whenever"
            },
            {
                url: "https://{var:domain}/wp-admin/post.php?action=edit&post=1",
                title: "wp-admin edit post page by id"
            },
            {
                url: "https://mc.a8c.com/rewind/debugger.php?site={var:domain}",
                title: "Rewind debugger"
            },
            {
                url: "https://wordpress.com/wp-admin/network/admin.php?page=store-admin&action=blog_id_search&id={var:domain}",
                title: "Store admin"
            },
            {
                url: "https://mc.a8c.com/site-profiles/?q={var:domain}",
                title: "Site profiles"
            },
            {
                url: "https://mc.a8c.com/tools/reportcard/domain/?domain={var:domain}",
                title: "DARC"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&step=theme",
                title: "wp-admin WooCommerce choose theme"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&step=theme&task=appearance",
                title: "wp-admin personalize store"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&task=payments&method=stripe",
                title: "wp-admin connect stripe"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout&section=stripe",
                title: "wp-admin manage Stripe"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fpayments%2Fdeposits",
                title: "wp-admin WooCommerce Payments deposit"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fpayments%2Ftransactions",
                title: "wp-admin WooCommerce Payments transactions"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fpayments%2Fdisputes",
                title: "wp-admin WooCommerce Payments dispute"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout&section=woocommerce_payments",
                title: "wp-admin WooCommerce Payments settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-dashboard",
                title: "wp-admin AutomateWoo Dashboard"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-logs",
                title: "wp-admin AutomateWoo Logs"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-queue",
                title: "wp-admin AutomateWoo Queue"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-carts",
                title: "wp-admin AutomateWoo Carts"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-guests",
                title: "wp-admin AutomateWoo Guests"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-opt-ins",
                title: "wp-admin AutomateWoo Opt-ins import opt-in"
            },
            {
                url: "https://wpstore101.wpcomstaging.com/wp-admin/admin.php?page=automatewoo-reports",
                title: "wp-admin AutomateWoo Reports"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-tools",
                title: "wp-admin AutomateWoo Tools reset workflow records guest eraser"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-settings",
                title: "wp-admin AutomateWoo Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Frevenue",
                title: "wp-admin WooCommerce Analytics Revenue"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Foverview",
                title: "wp-admin WooCommerce Analytics Overview"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Forders",
                title: "wp-admin WooCommerce Analytics Orders"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fproducts",
                title: "wp-admin WooCommerce Analytics Products"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fcategories",
                title: "wp-admin WooCommerce Analytics Categories"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fcoupons",
                title: "wp-admin WooCommerce Analytics Coupons"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Ftaxes",
                title: "wp-admin WooCommerce Analytics Taxes"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fdownloads",
                title: "wp-admin WooCommerce Analytics Downloads"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fstock",
                title: "wp-admin WooCommerce Analytics Stock"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fanalytics%2Fsettings",
                title: "wp-admin WooCommerce Analytics Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=page-optimize",
                title: "wp-admin Performance page optimize"
            },
            {
                url: "https://wpstore101.wpcomstaging.com/wp-admin/admin.php?page=wc-admin&path=%2Fmarketing",
                title: "wp-admin WooCommerce Marketing"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_booking",
                title: "wp-admin Bookings"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=bookable_resource",
                title: "wp-admin Bookings Resources"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_booking&page=create_booking",
                title: "wp-admin Bookings add booking create"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_booking&page=booking_calendar",
                title: "wp-admin Bookings calendar"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_booking&page=booking_notification",
                title: "wp-admin Bookings send notification"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_booking&page=wc_bookings_settings",
                title: "wp-admin Bookings settings"
            },
            {
                url: "https://{var:domain}/wp-admin/index.php?page=wc-memberships-setup&step=settings",
                title: "wp-admin Membership Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/index.php?page=wc-memberships-setup&step=access",
                title: "wp-admin Membership Access"
            },
            {
                url: "https://{var:domain}/wp-admin/index.php?page=wc-memberships-setup&step=member-perks",
                title: "wp-admin Membership Perks"
            },
            {
                url: "https://{var:domain}/wp-admin/index.php?page=wc-memberships-setup&step=member-emails",
                title: "wp-admin Membership Emails"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=memberships",
                title: "wp-admin Membership Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_membership_plan",
                title: "wp-admin Membership view plans"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_user_membership",
                title: "wp-admin Membership add members"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc_memberships_import_export",
                title: "wp-admin Membership Import/Export"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=subscriptions",
                title: "wp-admin Subscription Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=advanced",
                title: "wp-admin WooCommerce Advanced Settings force ssl checkout account endpoints"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=email",
                title: "wp-admin WooCommerce Settings email"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=account",
                title: "wp-admin WooCommerce Settings Accounts Privacy"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout",
                title: "wp-admin WooCommerce Settings Payments"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products",
                title: "wp-admin WooCommerce Settings Products"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-addons",
                title: "wp-admin WooCommerce browse extensions"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-addons&section=helper",
                title: "wp-admin WooCommerce.com subscriptions renew"
            },
            {
                url: "https://{var:domain}/wp-admin/plugin-install.php",
                title: "wp-admin install plugin"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=product",
                title: "wp-admin add product"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=classes",
                title: "wp-admin Shipping Classes"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=options",
                title: "wp-admin Shipping Options"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section",
                title: "wp-admin Shipping Zones"
            },
            {
                url: "https://{var:domain}/shop/",
                title: "Shop page"
            },
            {
                url: "https://{var:domain}/checkout/",
                title: "Checkout page"
            },
            {
                url: "https://{var:domain}/cart/",
                title: "Cart page"
            },
            {
                url: "https://{var:domain}/my-account/",
                title: "My Account page"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=bookable_resource",
                title: "wp-admin Booking Add Resource"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=inventory",
                title: "wp-admin Settings Products Inventory"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=downloadable",
                title: "wp-admin Settings Products downloadable"
            },
            {
                url: "https://{var:domain}",
                title: "Home page"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce_csv_import_suite",
                title: "CSV Import Suite Import Products"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce_csv_import_suite&tab=export",
                title: "CSV Import Suite Export Products"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=updraftplus",
                title: "UpdraftPlus backup/restore"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-events",
                title: "AutomateWoo events (secret)"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-tools",
                title: "AutomateWoo Tools reset workflow records guest eraser opt in importer"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=wcpv_vendor_settings",
                title: "wp-admin Product Vendors Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wcpv-commissions",
                title: "wp-admin Product Vendor Commission"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=wc_chained_products",
                title: "wp-admin Chained Product settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=ups",
                title: "wp-admin UPS settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wp-phpmyadmin-extension",
                title: "wp-admin phpMyAdmin sql"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=usps",
                title: "wp-admin USPS Shipping settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce_xero",
                title: "wp-admin Xero settings"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=wpml_plugin_log",
                title: "WP Mail Logging"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc_dynamic_pricing&tab=order+totals",
                title: "wp-admin WooCommerce Dynamic Pricing"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=settings-user-role-editor.php",
                title: "wp-admin User Role Editor options"
            },
            {
                url: "https://{var:domain}/wp-admin/users.php?page=users-user-role-editor.php",
                title: "wp-admin User Role Editor"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=groups-admin",
                title: "wp-admin Groups Admin"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=groups-admin-options",
                title: "wp-admin Group Admin Options"
            },
            {
                url: "https://{var:domain}/wp-admin/options.php",
                title: "wp-admin options ( hidden )"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=checkout_field_editor",
                title: "wp-admin Checkout Field Editor"
            },
            {
                url: "https://{var:domain}/wp-admin/profile.php",
                title: "wp-admin my user profile"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status&tab=connect",
                title: "wp-admin WooCommerce Service status"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=gutenberg-edit-site",
                title: "wp-admin Gutenberg Site Editor"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin&path=%2Fcustomers",
                title: "wp-admin WooCommerce Customers"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-referrals",
                title: "wp-admin Automatewoo Referrals"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-referral-advocates",
                title: "wp-admin AutomateWoo Referral Advocates"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-referral-codes",
                title: "wp-admin AutomateWoo Referral Codes"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-referral-invites",
                title: "wp-admin AutomateWoo Invites"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=warranties-bulk-update",
                title: "wp-admin Manage Warranties"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=warranties-settings",
                title: "wp-admin Warranties Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-settings&tab=status",
                title: "wp-admin AutomateWoo Status"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=woocommerce-bulk-stock-management",
                title: "wp-admin Bulk Stock Management"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=deposit_payment_plans",
                title: "wp-admin Deposit Payment Plans"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_voucher",
                title: "wp-admin PDF Vouchers"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=wp_template_part",
                title: "wp-admin new template part"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wp_template_part",
                title: "wp-admin template parts"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=gutenberg-edit-site",
                title: "wp-admin Site Editor"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=wc_membership_plan",
                title: "wp-admin add Membership Plan"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wc_membership_plan",
                title: "wp-admin view Membership Plans"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=product_attributes",
                title: "wp-admin Product Attributes"
            },
            {
                url: "https://{var:domain}/wp-admin/plugin-editor.php",
                title: "wp-admin Plugin Editor"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=addons",
                title: "wp-admin Product Add-Ons"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=square",
                title: "wp-admin Settings Square"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce-points-and-rewards&tab=settings",
                title: "wp-admin Configure Points and Rewards"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=qts_settings",
                title: "wp-admin Quote Requests settings"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=qts_quote_request",
                title: "wp-admin Quote Requests"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=sfn-cart-addons",
                title: "wp-admin Cart Add-Ons"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check",
                title: "wp-admin Tools Health Check"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check&tab=troubleshoot",
                title: "wp-admin Health check Troubleshooting"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check&tab=debug",
                title: "wp-admin Health Check Info"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=health-check&tab=tools",
                title: "wp-admin Health Check Tools file integrity mail check plugin compatibility"
            },
            {
                url: "https://{var:domain}/wp-admin/plugins.php?plugin_status=inactive",
                title: "wp-admin Inactive plugins"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports",
                title: "wp-admin WooCommerce Reports orders"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports&tab=customers",
                title: "wp-admin WooCommerce Reports Customers"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports&tab=stock",
                title: "wp-admin WooCommerce Reports Stock"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports&tab=taxes",
                title: "wp-admin WooCommerce Reports Taxes"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-reports&tab=wcs_labels",
                title: "wp-admin WooCommerce Reports Shipping Labels"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wcpf_project",
                title: "wp-admin Product Filters"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=wcpf",
                title: "wp-admin WooCommerce settings product filters"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=advanced_shipping_packages",
                title: "wp-admin Settings Advanced Shipping Packages"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=wcpv_product_vendors&post_type=product",
                title: "wp-admin Product Vendors"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=labels",
                title: "wp-admin settings Product Labels"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=automatewoo-settings&tab=referrals",
                title: "wp-admin Settings AutomateWoo Refer a friend"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=bookings-helper",
                title: "wp-admin Tools Bookings Helper"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=crontrol_admin_manage_page",
                title: "wp-admin Crontrol admin"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=crontrol_admin_options_page",
                title: "wp-admin Crontrol schedules"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-comments.php?comment_status=moderated",
                title: "wp-admin Pending Comments"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-comments.php?comment_status=spam",
                title: "wp-admin Comments Spam"
            },
            {
                url: "https://{var:domain}/wp-admin/link-manager.php",
                title: "wp-admin Links Manager"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=product_tag",
                title: "wp-admin Product Tag"
            },
            {
                url: "https://{var:domain}/wp-admin/user-new.php",
                title: "wp-admin Add new user"
            },
            {
                url: "https://{var:domain}/wp-admin/profile.php",
                title: "wp-admin Profile"
            },
            {
                url: "https://{var:domain}/wp-admin/import.php",
                title: "wp-admin Tools Import"
            },
            {
                url: "https://{var:domain}/wp-admin/export.php",
                title: "wp-admin Export"
            },
            {
                url: "https://{var:domain}/wp-admin/export-personal-data.php",
                title: "wp-admin Tools Export Personal Data"
            },
            {
                url: "https://{var:domain}/wp-admin/erase-personal-data.php",
                title: "wp-admin erase personal data"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=crontrol_admin_manage_page",
                title: "wp-admin Cron Events Crontrol"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=crontrol_admin_options_page",
                title: "wp-admin Crontrol Options"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=crontrol_admin_manage_page",
                title: "wp-admin Add Cron Event Crontrol"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=ai1wm_export",
                title: "wp-admin All in one migration export"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=ai1wm_import",
                title: "wp-admin All in one Migration Import"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=ai1wm_backups",
                title: "wp-admin All in one Migration Backups"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco",
                title: "wp-admin Loco"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco-theme",
                title: "wp-admin Loco Translate themes"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco-plugin",
                title: "wp-admin Loco Translate"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco-core",
                title: "wp-admin Loco Translate WordPress "
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco-lang",
                title: "wp-admin Loco Language"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=stats",
                title: "wp-admin Jetpack site stats"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=jetpack#/dashboard",
                title: "wp-admin Jetpack dashboard"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=feedback",
                title: "wp-admin Feedback export csv"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=fgf_settings",
                title: "wp-admin Free Gift Rules settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=gc_giftcards",
                title: "wp-admin Gift Cards"
            },
            {
                url: "https://tools.jetpack.com/debug/?url={var:domain}",
                title: "Test Jetpack Connection"
            },
            {
                url: "https://{var:domain}/wp-admin/post.php?action=edit&post={var:id}",
                title: "wp-admin Edit anything by id"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=loco-config&action=debug",
                title: "wp-admin Loco Translate debug"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-status&tab=logs",
                title: "wp-admin WooCommerce Status Logs"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=integration",
                title: "wp-admin WooCommerce Integration settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=products&section=deposits",
                title: "wp-admin Product settings Deposits"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=advance-quantity-page",
                title: "wp-admin Advanced Product Quantity setting"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=advance-quantity-page&tab=cart_quantity_configs_uw",
                title: "wp-admin Advanced Product Quantity Cart Configuration"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=advance-quantity-page&tab=bulk_product_quantity_settings_uw",
                title: "wp-admin Advanced Product Quantity Bulk Product Quantity Settings"
            },
            {
                url: "https://wordpress.com/post/{var:domain}/{var:id}",
                title: "Calypso edit post by id"
            },
            {
                url: "https://wordpress.com/hosting-config/{var:domain}",
                title: "Calypso Hosting Config"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=i13_woo_recaptcha",
                title: "wp-admin reCaptcha settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce-points-and-rewards",
                title: "wp-admin WooCommerce Points and Rewards settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=woocommerce-points-and-rewards&tab=log",
                title: "wp-admin Points and Rewards - points log"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product",
                title: "wp-admin Product Category update subscription renewal points"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=advanced&section=keys",
                title: "wp-admin WooCommerce REST API key"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=advanced&section=webhooks",
                title: "wp-admin WooCommerce add webhook"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=product_brand&post_type=product",
                title: "wp-admin WooCommerce Brand add new brand"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=product_tag&post_type=product",
                title: "wp-admin add Product Tag"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=product_importer",
                title: "wp-admin import products"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=product&page=product_exporter",
                title: "wp-admin Export products"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=redirection.php&sub=options",
                title: "wp-admin Redirection options"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=redirection.php",
                title: "wp-admin Redirection redirections"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc_customer_order_csv_export&tab=export",
                title: "wp-admin WooCommerce Customer CSV Export - export"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=wcpv_per_product",
                title: "wp-admin Vendors Per Product shipping setting"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=restrictions",
                title: "wp-admin WooCommerce Settings - restrictions"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=action-scheduler&status=in-progress",
                title: "wp-admin Action Scheduler jobs in progress"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=action-scheduler&status=pending",
                title: "wp-admin Action Scheduler - pending actions"
            },
            {
                url: "https://{var:domain}/wp-admin/tools.php?page=action-scheduler&status=failed",
                title: "wp-admin Schedule Action Failed "
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=multiple_shipping",
                title: "wp-admin Multiple Shipping"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=cookie-notice",
                title: "wp-admin GDPR cookies settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=followup-emails",
                title: "wp-admin WooCommerce Follow up Emails"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=followup-emails-settings",
                title: "wp-admin Follow Up Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=integration&section=google_analytics",
                title: "wp-amdin WooCommerce Integration - Google Analytics"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=followup-emails-reports",
                title: "wp-admin Follow Up Emails Reports"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-admin",
                title: "wp-admin WooCommerce Dashboard"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=shop_order",
                title: "wp-admin Add Order"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=aw_workflow",
                title: "wp-admin AutomateWoo new workflow"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=product_cat&post_type=product",
                title: "wp-admin Product Categories"
            },
            {
                url: "https://{var:domain}/wp-admin/post-new.php?post_type=product",
                title: "wp-admin new product"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout&section=thank-you-pages",
                title: "wp-admin Thank you pages"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=recommender_options",
                title: "wp-admin Recommender options"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=checkout&section=ppec_paypal",
                title: "wp-admin PayPal Checkout settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc_recommender_admin&tab=maintenance",
                title: "wp-admin WooCommerce Recommender maintenance"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=shipping&section=wc_shipping_distance_rate",
                title: "wp-admin Distance Rate Shipping settings"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-cart-notices",
                title: "wp-admin WooCommerce Cart Notices"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-cart-notices&tab=new",
                title: "wp-admin new Cart Notice"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-settings&tab=pre_orders",
                title: "wp-admin Pre orders"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc_pre_orders",
                title: "wp-admin Pre-orders manage"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wc-facebook",
                title: "wp-admin WooCommerce Facebook"
            },
            {
                url: "https://{var:domain}/wp-admin/theme-install.php?browse=featured",
                title: "wp-admin install theme"
            },
            {
                url: "https://wordpress.com/settings/performance/{var:domain}",
                title: "calypso Settings > Performance AMP"
            },
            {
                url: "https://{var:domain}/following/manage",
                title: "manage followed sites"
            },
            {
                url: "https://{var:domain}/wp-admin/edit-tags.php?taxonomy=post_tag",
                title: "wp-admin Tags"
            },
            {
                url: "https://{var:domain}/wp-admin/edit.php?post_type=wp_block",
                title: "wp-admin Reusable blocks"
            },
            {
                url: "https://wordpress.com/purchases/payment-methods/{var:domain}",
                title: "Calypso Payment methods"
            },
            {
                url: "https://wordpress.com/purchases/billing-history/{var:domain}",
                title: "Calypso Billing History"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain} ",
                title: "Checkout"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php",
                title: "wp-admin Site Settings general options anyone can register"
            },
            {
                url: "https://wordpress.com/settings/security/{var:domain}",
                title: "Calypso Security Settings"
            },
            {
                url: "https://{var:domain}/wp-admin/post.php?post={var:id}&action=edit&classic-editor",
                title: "wp-admin edit by any id classic editor"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=wp-mail-smtp",
                title: "wp-admin Wp Mail SMTP"
            },
            {
                url: "https://{var:domain}/wp-admin/options-general.php?page=insert-headers-and-footers",
                title: "wp-admin insert header footer scripts"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/personal",
                title: "Checkout Personal plan"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/premium",
                title: "Checkout Premium plan"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/business",
                title: "Checkout Business plan"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/ecommerce",
                title: "Checkout eCommerce plan"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/personal-2-years",
                title: "Checkout Personal plan 2 years"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/premium-2-years",
                title: "Checkout Premium plan 2 years"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/business-2-years",
                title: "Checkout Business plan 2 years"
            },
            {
                url: "https://wordpress.com/checkout/{var:domain}/ecommerce-2-years\n",
                title: "Checkout eCommerce plan 2 years"
            },
            {
                url: "https://{var:domain}/?clear-colors-cache=1",
                title: "clear colors cache"
            },
            {
                url: "https://{var:domain}/wp-admin/admin.php?page=media-sync-options",
                title: "wp-admin Media Sync"
            }
        ]
    };

    function dlog(message){
        if (options.DEBUG) {
            console.log(message);
        }
    }



    function _gm_getValue(key, defaultValue) {
        const value = GM_getValue(key);
        if (value == undefined) {
            return defaultValue;
        }
        return value;
    }


    //private scope and using $ without worry of conflict
    dlog('load wp quick navigate');

    function addStyle() {
        const vue_select_css = GM_getResourceText("IMPORTED_CSS");
        GM_addStyle(vue_select_css);

        const css = `
        .wpqn_zoom {
            position: fixed;
            bottom: 45px;
            right: 24px;
            height: 70px;
            z-index: 99999999;
          }

          .wpqn_zoom-fab {
            display: inline-block;
            width: 40px;
            height: 40px;
            line-height: 40px;
            border-radius: 50%;
            background-color: #009688;
            vertical-align: middle;
            text-decoration: none;
            text-align: center;
            transition: 0.2s ease-out;
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
            cursor: pointer;
            color: #FFF;
          }

          .wpqn_zoom-fab:hover {
            background-color: #4db6ac;
            box-shadow: 0 3px 3px 0 rgba(0, 0, 0, 0.14), 0 1px 7px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -1px rgba(0, 0, 0, 0.2);
          }

          .wpqn_zoom-btn-large {
            width: 60px;
            height: 60px;
            line-height: 60px;
          }

          .wpqn_zoom-btn-delete { background-color: #F44336; }

          .wpqn_zoom-btn-delete:hover { background-color: #e57373; }

          .wpqn_zoom-btn-edit { background-color: #ffeb3b; }

          .wpqn_zoom-btn-edit:hover { background-color: #fff176; }

          .wpqn_zoom-btn-add { background-color: #4CAF50; }

          .wpqn_zoom-btn-add:hover { background-color: #81c784; }

          .wpqn_zoom-btn-report { background-color: #2196F3; }

          .wpqn_zoom-btn-report:hover { background-color: #64b5f6; }

          .wpqn_zoom-btn-feedback { background-color: #9c27b0; }

          .wpqn_zoom-btn-feedback:hover { background-color: #ba68c8; }

          .wpqn_zoom-menu {
            position: absolute;
            right: 70px;
            left: auto;
            top: 50%;
            transform: translateY(-50%);
            height: 100%;
            width: 400px;
            list-style: none;
            text-align: right;
          }

          .wpqn_zoom-menu li {
            display: inline-block;
            margin-right: 10px;
          }

          .wpqn_zoom-card,
          .wpqn_zoom-card-modify-description {
            position: absolute;
            width: 600px;
            right: 250px;
            bottom: 250px;
            transition: box-shadow 0.25s;
            padding: 24px;
            border-radius: 2px;
            background-color: #fff68f; // #009688;
            box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14), 0 1px 5px 0 rgba(0, 0, 0, 0.12), 0 3px 1px -2px rgba(0, 0, 0, 0.2);
            color: black; // #FFF;
          }

          .wpqn_zoom-card ul,
          .wpqn_zoom-card-modify-description ul {
            -webkit-padding-start: 0;
            list-style: none;
            text-align: left;
          }

          .wpqn_scale-transition { transition: transform 0.3s cubic-bezier(0.53, 0.01, 0.36, 1.63) !important; }

          .wpqn_scale-transition.wpqn_scale-out {
            transform: scale(0);
            transition: transform 0.2s !important;
          }

          .wpqn_scale-transition.wpqn_scale-in { transform: scale(1); }

          #old_select_navigation_path {
              display:none;
          }

          .v-select .vs__dropdown-menu {
            max-height: 200px;
          }

          .wpqn_zoom-btn-report,
          .wpqn_zoom-btn-feedback {
              display: none;
          }

          }
        `;
        const style = document.createElement("style");
        style.type = "text/css";
        style.appendChild(document.createTextNode(css));
        document.head.appendChild(style);

    }



    function getDomainUrl(url) {
        return url.replace(VAR_DOMAIN, domain);
    }


    function addFloatButton() {
        dlog('addFloatButton');
        const floatButton = `
        <div id="wpqn_vue">
            <div class="wpqn_zoom">
            <a @click="toggleQuickNavigateAndButtons" class="wpqn_zoom-fab wpqn_zoom-btn-large" ><i class="fa"></i></a>
            <ul class="wpqn_zoom-menu">
            <li><a @click="showDeleteDescription" class="wpqn_zoom-fab wpqn_zoom-btn-sm wpqn_zoom-btn-delete wpqn_scale-transition wpqn_scale-out"><i class="fa"></i></a></li>
            <li><a @click="showEditDescription" class="wpqn_zoom-fab wpqn_zoom-btn-sm wpqn_zoom-btn-edit wpqn_scale-transition wpqn_scale-out"><i class="fa"></i></a></li>
            <li><a @click="addDescription" class="wpqn_zoom-fab wpqn_zoom-btn-sm wpqn_zoom-btn-add wpqn_scale-transition wpqn_scale-out"><i class="fa"></i></a></li>
            <li><a class="wpqn_zoom-fab wpqn_zoom-btn-sm wpqn_zoom-btn-report wpqn_scale-transition wpqn_scale-out"><i class="fa"></i></a></li>
            <li><a class="wpqn_zoom-fab wpqn_zoom-btn-sm wpqn_zoom-btn-feedback wpqn_scale-transition wpqn_scale-out"><i class="fa"></i></a></li>
            </ul>
            <div class="wpqn_zoom-card wpqn_scale-transition wpqn_scale-out">
                <div id="old_select_navigation_path">
                    <!-- input tag -->
                    <input id="searchbar"  type="text" v-on:keyup = "populatePaths"
                    v-model="path_tokens_string"
                    name="search" placeholder="Search wp_navigate_path..">

                    <div v-if="tooManyMatches">
                        <ul>
                            <li class="wp_navigation_path">Too many matches</li>
                        </ul>
                    </div>
                    <div v-else>
                        <ol id='navigation_paths_list'>
                            <div v-for="navigation_path in navigation_paths">
                                <li class="wp_navigation_path"><a @click="closeZoom" :href="navigation_path.url">{{navigation_path.title}}</a></li>
                            </div>
                        </ol>
                    </div>
                </div>

                <div>
                    <h4>{{domain}}</h4>
                    {{message}}<a id="click_navigation_path" :href="domainUrl">{{domainUrl}}</a>
                    <v-select id="select_navigation_path" v-model="url" @search:blur="checkCloseAll" @input="checkUrl" :options="options" :reduce="title => title.url" label="title">
                    <div v-else>
                        No var id
                    </div>
                </div>
            </div>
            <div class="wpqn_zoom-card-modify-description wpqn_scale-transition wpqn_scale-out">
                <div>
                    {{message}}
                    <v-select id="select_description" v-model="descriptionToModify" @search:blur="closeAll" @input="selectDescription" :options="options" :reduce="title => title.title" label="title">
                </div>
            </div>
        </div>
        `;
        const body = $('body');
        body.append(floatButton);

        $('.wpqn_zoom-btn-sm').click(function() {
            const btn = $(this);
            const card = $('.wpqn_zoom-card');

            if ($('.wpqn_zoom-card').hasClass('wpqn_scale-out')) {
              $('.wpqn_zoom-card').toggleClass('wpqn_scale-out');
            }
            if (btn.hasClass('wpqn_zoom-btn-delete')) {
              card.css('background-color', '#d32f2f');
            } else if (btn.hasClass('wpqn_zoom-btn-edit')) {
              card.css('background-color', '#fbc02d');
            } else if (btn.hasClass('wpqn_zoom-btn-add')) {
              card.css('background-color', '#388e3c');
            } else if (btn.hasClass('wpqn_zoom-btn-report')) {
              card.css('background-color', '#1976d2');
            } else {
              card.css('background-color', '#7b1fa2');
            }
        });

    }

    function getWordPressDomain(url) {
        const tokens = url.split('/');

        if (tokens.includes(WP_ADMIN) || tokens.includes(WP_LOGIN)) {
            const result = [];

            for (const token of tokens) {
                if (token.includes(':')) {
                    continue;
                }
                if (token.length == 0) {
                    continue;
                }
                if (token == WP_ADMIN || token == WP_LOGIN) {
                    break;
                }
                result.push(token);
                return result.join('/');
            }
        }

        for (const token of tokens) {
            if (token.startsWith(LOCALHOST)) {
                return token;
            }
        }


        tokens.reverse();

        const _tokens = tokens.filter(
            (item) => {
                return !item.includes('.php?');
            }
        );

        for (const _token of _tokens) {
            const items = _token.split('.');
            if (items.length > 1) {
                const lastItem = items[items.length - 1];
                const re = /[a-zA-Z]{2,}/;
                const reMatch = re.exec(lastItem);
                if (reMatch && lastItem.toLowerCase() != 'php') {
                    return _token;
                }
            }
        }
    }

    function getPaths(tokens) {
        const items = JSON.items;
        const result = [];
        for (const item of items) {
            let match = true;
            for (const token of tokens) {
                const description = item.title.toLowerCase();
                if (!description.includes(token.toLowerCase())) {
                    match = false;
                    break;
                }
            }
            if (match) {
                item.url = getDomainUrl(item.url);
                result.push(item);
            }
        }
        dlog(`getPaths returning ${result.length} paths`);
        return result;
    }

    function copyItemsToClipboard(items) {
        const WAIT_MILISECONDS_BETWEEN_COPY = 1000;

        $.each(items, function (indexInArray, valueOfElement) {
            setTimeout(
                () => {
                    dlog('copying '.concat(valueOfElement));
                    GM_setClipboard(valueOfElement);
                },
                WAIT_MILISECONDS_BETWEEN_COPY * (indexInArray + 1)
            );
        });
    }

    function saveItems(items) {
        GM_setValue(ITEMS, items);
    }

    function addMisingUrls(items, json) {
        let missingCount = 0;
        for (const item of json.items) {
            let found = false;
            for (const _item of items) {
                if (_item.title == item.title) {
                    found = true;
                    break;
                }
            }
            if (!found) {
                items.push(item);
                missingCount++;
            }
        }
        dlog(`added ${missingCount} missing urls`);
        GM_setValue(ITEMS, items);
    }

    function getItems(json=JSON) {
        const items = _gm_getValue(ITEMS, []);
        if (items.length == 0) {

            for (const item of json.items) {
                const d = {url: item.url, title: item.title};
                items.push(d);
            }
            GM_setValue(ITEMS, items);
        } else {
            if (options.ADD_MISSING_URLS) {
                addMisingUrls(items, json);
            }
        }
        return items;
    }

    function loadQuickNavigate() {

        const items = getItems(JSON);

        addStyle();

        addFloatButton();
        Vue.component ('v-select', VueSelect.VueSelect);

        const vue = new Vue({
            el: '#wpqn_vue',
            data: {
                navigation_paths: [],
                domain: domain,
                path_tokens_string: "",
                url: "",
                options:items,
                id: INVALID_ID,
                message: "",
                descriptionToModify: "",
                modifyMode: ""
            },
            computed: {
                containsVarId: function() {
                    return this.url.includes(VAR_ID);
                },
                domainUrl: function() {
                    return getDomainUrl(this.url);
                },
                tooManyMatches: function() {
                    return this.navigation_paths.length > MAX_PATHS;
                }
            },
            methods: {
                selectDescription() {
                    const description = this.descriptionToModify;
                    if (description === undefined || description.length == 0) {
                        this.showMessage(`abandoned ${this.modifyMode}`);
                        return false;
                    }
                    this.message = `${this.modifyMode} ${description}`;
                    this.modifyDescription();
                    // this.hideSmallButtons();
                    this.closeAll();
                },
                modifyDescription() {
                    dlog(`${this.modifyMode} ${this.descriptionToModify}`);
                    const proceed = confirm(`Please click OK to proceed with ${this.modifyMode} ${this.descriptionToModify}`);
                    if (!proceed) {
                        this.closeAll();
                        return false;
                    }
                    switch (this.modifyMode) {
                        case DELETE:
                            this.deleteDescription()
                            break;
                        case EDIT:
                            this.editDescription();
                            break;
                        default:
                            break;
                    }
                },
                saveItems(items) {
                    saveItems(items);
                    this.options = items;
                },
                swal(message) {
                    this.$swal('Done', message, 'success');
                },
                addDescription() {
                    this.modifyMode = ADD;
                    const href = window.location.href;
                    const domain = getWordPressDomain(href);
                    const url = href.replace(domain, VAR_DOMAIN);
                    const description = prompt(`Adding new path. Please enter description for ${url}`);
                    if (description === null || description.length == 0) {
                        this.showMessage('abandoned Add description');
                        this.closeAll();
                        return false;
                    }
                    const d = {url: url, title: description};
                    const items = getItems();
                    items.push(d)
                    this.saveItems(items);

                    this.closeAll(() => {
                        this.swal("Added new path");
                    });

                },
                getModifyDescriptionCard() {
                    const zoomCard = $('.wpqn_zoom-card-modify-description');
                    return zoomCard;
                },
                showMessage(message) {
                    setTimeout(
                        () => {
                            this.message = message;
                        }
                        , 1000
                    );
                },
                showCard(card) {
                    card.removeClass('wpqn_scale-out');
                },
                hideCard(card) {
                    card.addClass('wpqn_scale-out');
                },
                showModifyDescription() {
                    this.hideQuickNavigate(true);
                    this.hideSmallButtons(true);
                    this.showMessage(`Choose description to ${this.modifyMode}`);

                    const zoomCard = this.getModifyDescriptionCard();
                    this.showCard(zoomCard);

                    const searchBar = $('#select_description .vs__search');
                    searchBar.focus();
                },
                showDeleteDescription() {
                    this.modifyMode = DELETE;
                    this.showModifyDescription();
                },
                showEditDescription() {
                    this.modifyMode = EDIT;
                    this.showModifyDescription();
                },
                hideModifyDescriptionCard() {
                    setTimeout(
                        () => {
                            const zoomCard = this.getModifyDescriptionCard();
                            // zoomCard.addClass('wpqn_scale-out');
                            this.hideCard(zoomCard);
                            this.message = "";
                        },
                        1000
                    )
                },
                deleteDescription() {
                    const items = getItems();

                    for (let index = 0; index < items.length; index++) {
                        const item =items[index];
                        if (item.title == this.descriptionToModify) {
                            items.splice(index, 1);
                            break;
                        }
                    }

                    this.saveItems(items);
                    this.closeAll(() => {
                        this.swal('Deleted path');
                    });
                },
                editDescription() {
                    const items = getItems();
                    const newDescription = prompt('Enter new description', this.descriptionToModify);
                    if (newDescription === null) {
                        this.descriptionToModify = '';
                        this.showMessage('Cancelling');
                        this.closeAll();
                        return false;
                    }
                    for (const item of items) {
                        if (item.title == this.descriptionToModify) {
                            item.title = newDescription;
                            break;
                        }
                    }
                    this.saveItems(items);
                    this.closeAll(() => {
                        this.swal('Edited path description');
                    });
                },
                toggleSmallButtons() {
                    const smallButtons = $('.wpqn_zoom-btn-sm');
                    // $('.wpqn_zoom-btn-sm').toggleClass('wpqn_scale-out');
                    this.toggleVisible(smallButtons);
                    this.initZoomMenu();
                },
                getNavigateCard() {
                    const zoomCard = $('.wpqn_zoom-card');
                    return zoomCard;
                },
                onEscape() {
                    this.closeAll();
                },
                hideQuickNavigate(quick = false) {
                    const timeout = quick ? 100 : 1000;
                    setTimeout(
                        () => {
                            const zoomCard = this.getNavigateCard();
                            // zoomCard.addClass('wpqn_scale-out');
                            this.hideCard(zoomCard);
                            this.message = "";
                        },
                        timeout
                    );
                },
                checkCloseAll() {
                    setTimeout(
                        () => {
                            if (this.modifyMode == "") {
                                this.closeAll();
                            }
                        },
                        2000
                    )
                },
                closeAll(callback = false) {
                    this.hideSmallButtons();
                    this.hideModifyDescriptionCard();
                    this.hideQuickNavigate();
                    setTimeout(
                        () => {
                            this.descriptionToModify = "";
                            this.message = "",
                            this.modifyMode = "";
                            if (callback) {
                                callback();
                            }
                        },
                        1000
                    )
                },
                hideSmallButtons(quick = false) {
                    const timeout = quick ? 100 : 1000;
                    setTimeout(
                        () => {
                            const smallButtons = $('.wpqn_zoom-btn-sm');
                            // $('.wpqn_zoom-btn-sm').addClass('wpqn_scale-out');
                            this.hideCard(smallButtons);
                            this.hideZoomMenu();
                        },
                        timeout
                    );
                },
                initZoomMenu() {
                    setTimeout(
                        () => {
                            const smallButtons = $('.wpqn_zoom-btn-sm');

                            if (this.cardIsVisible(smallButtons)) {
                                this.showZoomMenu();
                            } else {
                                this.hideZoomMenu();
                            }
                        },
                        1000
                    )
                },
                showZoomMenu() {
                    const menu = $('.wpqn_zoom-menu');
                    menu.show();
                },
                hideZoomMenu() {
                    const menu = $('.wpqn_zoom-menu');
                    menu.hide();
                },
                cardIsVisible(card) {
                    return !card.hasClass('wpqn_scale-out');
                },
                toggleVisible(card) {
                    card.toggleClass('wpqn_scale-out');
                },
                toggleQuickNavigate() {
                    const zoomCard = this.getNavigateCard();
                    // zoomCard.toggleClass('wpqn_scale-out');
                    this.toggleVisible(zoomCard);
                    // if (!zoomCard.hasClass('wpqn_scale-out')) {
                    if (this.cardIsVisible(zoomCard)) {
                        this.hideModifyDescriptionCard();
                        const searchBar = $('#select_navigation_path .vs__search');
                        searchBar.focus();
                        this.showMessage('Type or select a navigation path below.');
                    }
                },
                toggleQuickNavigateAndButtons() {
                    this.toggleQuickNavigate();
                    this.toggleSmallButtons();
                },
                populatePaths() {
                    if (this.path_tokens_string.length > 0) {
                        this.navigation_paths = [];
                        const pathTokens = this.path_tokens_string.split(' ');
                        const paths = getPaths(pathTokens);
                        for (const path of paths) {
                            this.navigation_paths.push(path);
                        }
                    }
                },
                isNumber: function(evt) {
                    evt = (evt) ? evt : window.event;
                    const charCode = (evt.which) ? evt.which : evt.keyCode;
                    if ((charCode > 31 && (charCode < 48 || charCode > 57)) && charCode !== 46) {
                      evt.preventDefault();
                    } else {
                      return true;
                    }
                },
                copyUrlToClipboard(url) {
                    const items = [url];
                    copyItemsToClipboard(items);
                },
                pulseMessage(message) {
                    let suffix = '..';
                    setInterval(
                        () => {
                            suffix = suffix == '..' ? '....' : '..';
                            this.message = `${message}${suffix}`;
                        },
                        500
                    );
                },
                loadUrl() {
                    this.hideSmallButtons();
                    let url = this.domainUrl;
                    dlog(`domainUrl ${url}`);
                    if (this.containsVarId) {
                        if (this.id === INVALID_ID) {
                            return false;
                        }
                        url = url.replace(VAR_ID, this.id);
                    }
                    this.pulseMessage('Loading');
                    this.copyUrlToClipboard(url);
                    window.location.href = url;
                },
                checkUrl() {
                    this.modifyMode = LOAD;
                    if (!this.containsVarId) {
                        this.loadUrl();
                    } else {
                        this.askForId();
                        this.loadUrl();
                    }
                },
                askForId() {
                    this.message = 'Waiting for id';
                    this.id = (function ask() {
                        const n = prompt('Enter a postive integer:');
                        return isNaN(n) || +n < 0 || parseInt(n) != n ? ask() : n;
                      }());
                },
                closeZoom() {
                    const zoomCard = $('.wpqn_zoom-card');
                    // zoomCard.toggleClass('wpqn_scale-out');
                    this.toggleVisible(zoomCard);
                }
            },
            created: () => {
                dlog('vue created');
            }
        });
        vue.initZoomMenu();
        loadedQuickNavigate = true;
    }

    function getHref() {

        const removeString = '?site=wordpress.com';
        const href = window.location.href;
        dlog(`href = ${href}`);
        const removeStringIndex = href.toLowerCase().indexOf(removeString);
        if (removeStringIndex > 0 ) {
            return href.substring(0, removeStringIndex);
        }
        return href;
    }

    function excludeDomain(domain) {

        dlog(`excludeDomain checking ${domain}`);
        for (const exclDomain of EXCLUDE_DOMAINS) {
            dlog(`checking ${domain} vs exclude ${exclDomain}`);
            if (domain.toLowerCase().indexOf(exclDomain.toLowerCase()) >= 0 ) {
                return true;
            }
        }
        return false;
    }

    $(function() {
        // do something on document ready
        if (loadedQuickNavigate) {
            dlog('loadedQuickNavigate');
            return false;
        }
        const href = getHref();
        dlog(`sanitized href = ${href}`);
        domain = getWordPressDomain(href);
        dlog(`domain = ${domain}`);

        if (excludeDomain(domain) || domain == 'wordpress.com') {
            dlog(`Not loading quick navigate for ${domain}`)
            return false;
        } else if (window.top === window.self) { // check whether in iframe
            dlog('iframe check');
            const wpadminbar = $('#wpadminbar');
            const wpcom = $('#wpcom');
            if (wpadminbar.length > 0 || wpcom.length > 0) {
                dlog('found wpadminbar or wpcom');
                loadQuickNavigate();
            } else if (href.toLowerCase().includes('/wp-admin/')){
                dlog('found wp-admin');
                loadQuickNavigate();
            } else if (href.toLowerCase().includes('customize')){
                dlog('found customize');
                loadQuickNavigate();
            } else if (href.includes('wordpress.com') || href.includes('wp.com')) {
                dlog('found wordpress.com, wp.com');
                loadQuickNavigate();
            } else if (domain == 'public-api.wordpress.com') {
                dlog('found domain public-api.wordpress.com')
                loadQuickNavigate();
            } else {
                dlog('=====  else =====');
                const url = `https://${domain}/wp-login.php`;
                fetch(url)
                .then(response => {
                    if (response.ok) {
                        dlog('found wp-login.php');
                        loadQuickNavigate();
                    } else {
                        return false;
                    }
                });
            }
        } else {
            dlog(`Could not qualify ${href} for quick navigate`);
        }
    }); // end ready

})(jQuery); //invoke nameless function and pass it the jQuery object

// version 0.1
//   initial release
// . proof of concept

// version 0.11
// .  added some probe to load Quick Navigate button only for WordPress sites

// version 0.12
//    will focus on searchbar on zoomcard appearing
// .  close zoomcard on clicking link

// version 0.14
// . added check to not load in iframe
// . removed calling populateList - not needed

// version 0.15
// . use v-select VueSelect

// version 0.16
// . removed loading in iframe, troubleshooting Customizer

// version 0.17
// . fixed Customizer issue

// version 0.18
// . css changes for zoom-card, vs__dropdown-menu

// version 0.19
// . renamed zoom classes to wpqn_zoom
// . renamed scale- classes to wpqn_scale-

// version 0.20
// . implemented Edit anything by id

// version 0.21
// . implemented add, edit, delete description

// version 0.22
// . renamed to WordPress Quick Navigate
// . avoid loading on https://hud.happychat.io/

// version 0.23
// . renamed script name

// version 0.24
// . refactored to closeAll, toggleVisible, showCard, hideCard, isVisible

// version 0.25
// .  fixed zoom-menu blocking elements

// version 0.26
// . auto close if lose focus
// . added json source documentation
// . removed extraneous Alfred json lines
// . added pulseMessage for loadUrl

// version 0.27
// . added getHref to sanitize href

// version 0.28
// . removed unused functions
// . changed literal url, title to constants
// . display domain in Quick Navigate search bar
// . fixed wrong case of json.items

// version 0.29
// . added vue-swal, https://sweetalert.js.org/guides/
// . added schedule.happy.tools in EXCLUDE_DOMAIN