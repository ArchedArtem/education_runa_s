import styles from './page.module.scss';
import HeroSection from './components/HeroSection/HeroSection';
import FeaturesBento from './components/FeaturesBento/FeaturesBento';
import CoursePreview from './components/CoursePreview/CoursePreview';
import CtaSection from './components/CtaSection/CtaSection';

export default function WelcomePage() {
    return (
        <div className={styles.pageWrapper}>
            <div className={styles.bgDecorations}>
                <div className={styles.glowBlue}></div>
                <div className={styles.glowGray}></div>
                <div className={styles.floatShape1}></div>
                <div className={styles.floatShape2}></div>
            </div>

            <div className="pt-24">
                <HeroSection />
                 <FeaturesBento />
                 <CoursePreview />
                 <CtaSection />
            </div>
        </div>
    );
}