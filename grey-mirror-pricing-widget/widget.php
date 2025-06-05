<?php
use Elementor\Widget_Base;
use Elementor\Controls_Manager;
use Elementor\Repeater;

if (!defined('ABSPATH')) exit;

class GM_Pricing_Widget extends Widget_Base {
    public function get_name() {
        return 'gm_pricing_calculator';
    }

    public function get_title() {
        return 'Grey Mirror Pricing Calculator';
    }

    public function get_icon() {
        return 'eicon-calculator';
    }

    public function get_categories() {
        return ['general'];
    }

    protected function register_controls() {
        // no controls needed
    }

    protected function render() {
        ?>
        <div id="gm-pricing-calculator" class="gm-widget">
            <div class="gm-flow-select">
                <label><input type="radio" name="gm_flow" value="quiz" checked> Help Me Choose</label>
                <label><input type="radio" name="gm_flow" value="manual"> I Know What I Want</label>
            </div>
            <div class="gm-quiz" style="display:block">
                <div class="gm-question"></div>
                <button class="gm-yes">Yes</button>
                <button class="gm-no">No</button>
            </div>
            <div class="gm-manual" style="display:none">
                <form class="gm-service-list"></form>
                <button class="gm-manual-next">Next</button>
            </div>
            <div class="gm-inputs" style="display:none">
                <label>Locations: <input type="number" id="gm-locations" min="1" value="1"></label>
                <label>Website pages: <input type="number" id="gm-pages" min="1" value="50"></label>
                <label>Discount: 
                    <select id="gm-discount">
                        <option value="none">No Discount</option>
                        <option value="super">Super-Duper Discount</option>
                        <option value="dirt">I have dirt on the founders</option>
                        <option value="reverse">Founders have dirt on me (Reverse)</option>
                    </select>
                </label>
                <button class="gm-calc">Calculate Pricing</button>
            </div>
            <div class="gm-results" style="display:none">
                <div class="gm-summary"></div>
                <div class="gm-table"></div>
            </div>
        </div>
        <?php
    }
}
