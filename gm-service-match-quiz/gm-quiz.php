<?php
/**
 * Plugin Name: Grey Mirror Service-Match Quiz
 * Description: Shortcode quiz to match services.
 * Version: 0.4.1
 * Author: Grey Mirror Digital
 * Text Domain: gm-quiz
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

define( 'GM_QUIZ_VERSION', '0.4.1' );

define( 'GM_QUIZ_DIR', plugin_dir_path( __FILE__ ) );

function gm_quiz_assets() {
    wp_enqueue_style( 'gm-quiz', plugins_url( 'gm-quiz.css', __FILE__ ), [], GM_QUIZ_VERSION );
    wp_enqueue_script( 'gm-quiz', plugins_url( 'gm-quiz.js', __FILE__ ), [], GM_QUIZ_VERSION, true );

    $questions = [
        ['id' => 'q1', 'text' => 'Do you want to be the first practice patients see when they Google “your specialty near me”?', 'subs' => ['S1', 'S2', 'S3']],
        ['id' => 'q2', 'text' => 'Does your website feel dated or struggle to turn visitors into booked patients?', 'subs' => ['S4']],
        ['id' => 'q3', 'text' => 'Do you want your site to appear ahead of competitors in Google searches?', 'subs' => ['S5']],
        ['id' => 'q4', 'text' => 'Is your stream of five-star reviews falling short of your competitors?', 'subs' => ['S6']],
        ['id' => 'q5', 'text' => 'Are you interested in making patients feel valued—and preventing bad reviews—with a personalized follow-up call?', 'subs' => ['S7']],
        ['id' => 'q6', 'text' => 'Do you want more buzz about your practice in the online groups patients trust?', 'subs' => ['S8']],
        ['id' => 'q7', 'text' => 'Should AI tools like ChatGPT recommend your clinic as the top provider?', 'subs' => ['S9', 'S10', 'S11']],
    ];

    $sub_to_pillar = [
        'S1' => 'LPO',
        'S2' => 'LPO',
        'S3' => 'LPO',
        'S4' => 'WSA',
        'S5' => 'WSA',
        'S6' => 'CRE',
        'S7' => 'CRE',
        'S8' => 'CRE',
        'S9' => 'ASV',
        'S10' => 'ASV',
        'S11' => 'ASV',
    ];

    $pillars = [
        'LPO' => [
            'name' => 'Local Pack Optimization',
            'url'  => 'https://greymirrordigital.com/marketing-solutions/local-pack-optimization/',
            'services' => ['S1', 'S2', 'S3'],
        ],
        'WSA' => [
            'name' => 'Website & Search Authority',
            'url'  => 'https://greymirrordigital.com/marketing-solutions/website-and-search-authority/',
            'services' => ['S4', 'S5'],
        ],
        'CRE' => [
            'name' => 'Conversion & Reputation Engine',
            'url'  => 'https://greymirrordigital.com/marketing-solutions/conversion-and-reputation-engine/',
            'services' => ['S6', 'S7', 'S8'],
        ],
        'ASV' => [
            'name' => 'AI Search Visibility',
            'url'  => 'https://greymirrordigital.com/marketing-solutions/ai-search-visibility/',
            'services' => ['S9', 'S10', 'S11'],
        ],
    ];

    wp_localize_script( 'gm-quiz', 'gmQuizData', [
        'questions' => $questions,
        'subToPillar' => $sub_to_pillar,
        'pillars' => $pillars,
        'ajaxUrl' => admin_url( 'admin-ajax.php' ),
        'restUrl' => esc_url_raw( rest_url( 'gm/v1/lead' ) ),
    ] );
}
add_action( 'wp_enqueue_scripts', 'gm_quiz_assets' );

function gm_quiz_shortcode( $atts = [] ) {
    $atts = shortcode_atts([
        'heading' => 'We have 2 047 unique service plans.<br>Let’s find the one that fits your practice.',
        'start_text' => 'Start 30-second Quiz →',
        'accent_color' => '',
    ], $atts, 'gm_quiz' );
    $style = $atts['accent_color'] ? ' style="--accent:' . esc_attr( $atts['accent_color'] ) . ';"' : '';
    ob_start();
    ?>
<div class="gm-quiz"<?php echo $style; ?>>
  <div class="gm-quiz__card" part="card">
    <div class="gm-quiz__progress"><div class="gm-quiz__bar"></div></div>

    <section class="gm-quiz__intro">
      <h2><?php echo wp_kses_post( $atts['heading'] ); ?></h2>
      <button class="gm-quiz__primary" data-step="start"><?php echo esc_html( $atts['start_text'] ); ?></button>
    </section>

    <section class="gm-quiz__result" hidden>
      <h3>Your best-fit services</h3>
      <div class="gm-quiz__pillars"></div>

      <form class="gm-quiz__email">
        <label>Enter your email for a custom price estimate</label>
        <input type="email" required placeholder="you@example.com" />
        <button class="gm-quiz__primary">Send my Price Estimate →</button>
      </form>

      <p class="gm-quiz__thanks" hidden>Thanks! Check your inbox.</p>
      <p class="gm-quiz__fallback" hidden>Looks like you’re already dialed in! <a href="https://greymirrordigital.com/contact/">Contact us</a> for a second opinion.</p>
    </section>
  </div>
</div>
<?php
    return ob_get_clean();
}
add_shortcode( 'gm_quiz', 'gm_quiz_shortcode' );

function gm_quiz_register_routes() {
    register_rest_route( 'gm/v1', '/lead', [
        'methods' => 'POST',
        'callback' => 'gm_quiz_handle_lead',
        'permission_callback' => '__return_true',
    ] );
}
add_action( 'rest_api_init', 'gm_quiz_register_routes' );

function gm_quiz_handle_lead( WP_REST_Request $request ) {
    $data  = $request->get_json_params();
    $email = isset( $data['email'] ) ? sanitize_email( $data['email'] ) : '';
    $to     = 'Jake@greymirrordigital.com';
    $subject = 'New Quiz Lead';
    $message = "Email: {$email}\n\n" . print_r( $data, true );
    wp_mail( $to, $subject, $message );

    return [ 'success' => true ];
}

add_action( 'wp_ajax_gm_quiz_email', 'gm_quiz_ajax_email' );
add_action( 'wp_ajax_nopriv_gm_quiz_email', 'gm_quiz_ajax_email' );
function gm_quiz_ajax_email() {
    $email = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
    $data  = isset( $_POST['data'] ) ? wp_unslash( $_POST['data'] ) : '';
    $to     = 'Jake@greymirrordigital.com';
    $subject = 'New Quiz Lead';
    $message = "Email: {$email}\n\n{$data}";
    wp_mail( $to, $subject, $message );
    wp_send_json_success();
}

function gm_quiz_register_elementor_widget( $widgets_manager ) {
    if ( ! class_exists( '\\Elementor\\Widget_Base' ) ) {
        return;
    }
    require_once GM_QUIZ_DIR . 'gm-elementor-widget.php';
    $widgets_manager->register( new GM_Quiz_Elementor_Widget() );
}
add_action( 'elementor/widgets/register', 'gm_quiz_register_elementor_widget' );
