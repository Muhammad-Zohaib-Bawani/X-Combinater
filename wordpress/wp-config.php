<?php
define( 'WP_CACHE', true );
define('WP_HOME', 'https://xcombinater.com/wordpress');
define('WP_SITEURL', 'https://xcombinater.com/wordpress');

/**
 * The base configuration for WordPress
 *
 * The wp-config.php creation script uses this file during the installation.
 * You don't have to use the web site, you can copy this file to "wp-config.php"
 * and fill in the values.
 *
 * This file contains the following configurations:
 *
 * * Database settings
 * * Secret keys
 * * Database table prefix
 * * Localized language
 * * ABSPATH
 *
 * @link https://wordpress.org/support/article/editing-wp-config-php/
 *
 * @package WordPress
 */

// ** Database settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define( 'DB_NAME', 'u464088866_QK6Ji' );

/** Database username */
define( 'DB_USER', 'u464088866_u8vi4' );

/** Database password */
define( 'DB_PASSWORD', '1C8IBT94jn' );

/** Database hostname */
define( 'DB_HOST', '127.0.0.1' );

/** Database charset to use in creating database tables. */
define( 'DB_CHARSET', 'utf8' );

/** The database collate type. Don't change this if in doubt. */
define( 'DB_COLLATE', '' );

/**#@+
 * Authentication unique keys and salts.
 *
 * Change these to different unique phrases! You can generate these using
 * the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}.
 *
 * You can change these at any point in time to invalidate all existing cookies.
 * This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define( 'AUTH_KEY',          'VoWRWs8?k-g+xBk1nfs9*r)2C*sU<R*(!4}Xm-+yeFA<`{%.f|G5G?c6h[sl{Kr=' );
define( 'SECURE_AUTH_KEY',   'V7.&79^8IKvf0,NyJV_Z](+n5A s!w@I.0pceD4g{tZx/;OOB/_HjSGVme;xF8nr' );
define( 'LOGGED_IN_KEY',     '6]n|k%tqZ:MG-u0}UW,E^Srg s4$=:mO2lF~lLOf+LXtj1`5)50rkf}lMFm?Eae~' );
define( 'NONCE_KEY',         '|P~K@^pw9JuKX3CKFVYUC#fJx(.E1IW];r=J1/&=+20)ih3-f7$_!nmNA.82_rxj' );
define( 'AUTH_SALT',         '!gPtmDv/`a|QZ I_l7492I{!+5i9}_*Q3M+j[=0~~`A^ZdtLz=F@F@.RK!9 HCD(' );
define( 'SECURE_AUTH_SALT',  '2W(TiI<VJfyinw<2.H@9>u/[rBllywaB!<D}H`8%h)afpV2P^RPYtuMZ$=AEWj=]' );
define( 'LOGGED_IN_SALT',    '|fTG|(H)F4CGbF$fwJ2hL]Y-eIT{4)B{E^uAf7fV,`2md|#apmopXoJMM1qC[zc9' );
define( 'NONCE_SALT',        'm}E+a`D;.Vk$qv09HOW7E5GvI,w4prkCn[@%~CDoH=sn6YtpG)5_8:l,96qe~Ih3' );
define( 'WP_CACHE_KEY_SALT', 'hW3*I,tNn,wql:~nY-XJ_pfja-wAt#N,laCmR!xCe;W)7:`d)eHGAKl|}+qed&@]' );


/**#@-*/

/**
 * WordPress database table prefix.
 *
 * You can have multiple installations in one database if you give each
 * a unique prefix. Only numbers, letters, and underscores please!
 */
$table_prefix = 'wp_';


/* Add any custom values between this line and the "stop editing" line. */



/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 *
 * For information on other constants that can be used for debugging,
 * visit the documentation.
 *
 * @link https://wordpress.org/support/article/debugging-in-wordpress/
 */
if ( ! defined( 'WP_DEBUG' ) ) {
	define( 'WP_DEBUG', false );
}

define( 'FS_METHOD', 'direct' );
define( 'COOKIEHASH', '5440491fed25477be43a4b1a4884ca2c' );
define( 'WP_AUTO_UPDATE_CORE', 'minor' );
/* That's all, stop editing! Happy publishing. */

/** Absolute path to the WordPress directory. */
if ( ! defined( 'ABSPATH' ) ) {
	define( 'ABSPATH', __DIR__ . '/' );
}

/** Sets up WordPress vars and included files. */
require_once ABSPATH . 'wp-settings.php';
