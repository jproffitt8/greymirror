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
        <div class="gm-wrapper">
            <div id="gm-pricing-calculator" class="gm-card">
                <div class="gm-progress"><div class="gm-progress-bar"></div></div>
                <div class="gm-flow-select">
                    <label class="gm-pill"><input type="radio" name="gm_flow" value="quiz" checked><span>Help Me Choose</span></label>
                    <label class="gm-pill"><input type="radio" name="gm_flow" value="manual"><span>I Know What I Want</span></label>
                </div>
                <div class="gm-quiz" style="display:block">
                    <div class="gm-question"></div>
                    <div class="gm-options"></div>
                    <div class="gm-nav" style="display:none">
                        <button class="gm-back" type="button">Back</button>
                        <button class="gm-next" type="button">Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                    </div>
                </div>
                <div class="gm-manual" style="display:none">
                    <form class="gm-service-list"></form>
                    <button class="gm-manual-next gm-next">Next <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                </div>
                <div class="gm-inputs" style="display:none">
                    <div class="gm-question">Discount:</div>
                    <label class="gm-select">
                        <select id="gm-discount">
                            <option value="none">No Discount</option>
                            <option value="super">Super-Duper Discount</option>
                            <option value="dirt">I have dirt on the founders</option>
                            <option value="reverse">Founders have dirt on me (Reverse)</option>
                        </select>
                    </label>
                    <button class="gm-calc gm-next">See Pricing <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg></button>
                </div>
                <div class="gm-results" style="display:none">
                    <div class="gm-summary"></div>
                    <div class="gm-table"></div>
                    <button class="gm-cta">Lock My Plan</button>
                </div>
            </div>
        </div>
        <?php
    }
}
