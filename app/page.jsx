"use client";

import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
    {/* Hero Section with Background Image */}
      <section className="relative h-[810px]  flex items-center justify-center overflow-hidden bg-cover bg-center" style={{backgroundImage: 'url(/BG-home%201.svg)', backgroundPosition: 'top', backgroundSize: 'fit'}}>
        <div className="relative z-10 container mx-auto px-6 text-center">
          <h1 
            className="text-[128px] leading-[95px] tracking-[4px] uppercase mb-6 text-black"
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'bold' }}
          >
            Wizard Quest
          </h1>
          <p className="text-2xl text-gray-900 mb-12 max-w-[634px] mx-auto ">
            A revolutionary 2D RPG where your movements become magical spells
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/game"
              className="px-8 py-4 bg-[#7171ea] hover:bg-[#5a5ad4] text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105"
            >
              Start Adventure
            </Link>
            <a 
              href="#features" 
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#features')?.scrollIntoView({
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              className="px-8 py-4 bg-white hover:bg-gray-50 text-gray-900   rounded-xl font-bold text-lg transition-all transform hover:scale-105 cursor-pointer"
            >
              Discover
            </a>
          </div>
        </div>
      </section>

      {/* Features Section - A Unique Experience */}
      <section id="features" className="py-20 px-6 bg-black relative">
        <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.04)]"></div>
        <div className="container mx-auto relative z-10">
          <h2 
            className="text-[64px] leading-[36px] text-center mb-16 text-white"
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
          >
            A Unique Experience
          </h2>
          
          <div className="grid md:grid-cols-3 gap-[94px] max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white rounded-[15px] overflow-hidden h-[396px] relative">
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[100px]">
                <Image src="/svg/MC-pose-neutral-1.svg" alt="Gesture" fill className="object-contain" />
              </div>
              <div className="absolute bottom-0 p-8 text-center w-full">
                <h3 
                  className="text-[20px] leading-[28px] mb-4 text-gray-900"
                  style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                >
                  Gesture Recognition
                </h3>
                <p className="text-[14px] leading-[22.75px] text-[#4a5565]">
                  Draw spells in the air with your hand and watch them come to life in real-time. Our advanced AI recognizes your movements instantly.
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-[15px] overflow-hidden h-[396px] relative">
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[100px] flex gap-2 justify-center">
                <Image src="/svg/element-feu.svg" alt="Elements" width={32} height={100} className="object-contain" />
                <Image src="/svg/element-glace.svg" alt="Elements" width={32} height={100} className="object-contain" />
                <Image src="/svg/element-foudre.svg" alt="Elements" width={32} height={100} className="object-contain" />
              </div>
              <div className="absolute bottom-0 p-8 text-center w-full">
                <h3 
                  className="text-[20px] leading-[28px] mb-4 text-gray-900"
                  style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                >
                  4 Magic Elements
                </h3>
                <p className="text-[14px] leading-[22.75px] text-[#4a5565]">
                  Fire, Ice, Earth, Lightning. Use your body to draw elemental symbols and unleash devastating spells against your enemies.
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-[15px] overflow-hidden h-[396px] relative">
              <div className="absolute top-[60px] left-1/2 -translate-x-1/2 w-[100px] h-[100px]">
                <Image src="/svg/element-feu.svg" alt="Boss" fill className="object-contain" />
              </div>
              <div className="absolute bottom-0 p-8 text-center w-full">
                <h3 
                  className="text-[20px] leading-[28px] mb-4 text-gray-900"
                  style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                >
                  Epic Bosses
                </h3>
                <p className="text-[14px] leading-[22.75px] text-[#4a5565]">
                  Face bosses with complex attack patterns and multiple phases. Finish without taking damage for rewards!
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How to Play Section */}
      <section 
        className="relative py-20 px-6"
        style={{
          backgroundImage: `url(/pixelatedBackground.svg)`,
          backgroundSize: 'fit',
          backgroundPosition: 'top'
        }}
      >
        <div className="container mx-auto mt-60">
          <h2 
            className="text-[64px] leading-[36px] text-center mb-16 text-[#00c950]"
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
          >
            How to Play?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-start">
            <div className="space-y-8">
              {/* Step 1 */}
              <div className="flex items-start gap-6 relative">
                <div className="w-[56px] h-[56px] rounded-full bg-[#d95763] flex items-center justify-center text-white text-[40px] leading-[36px] flex-shrink-0">
                  1
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-[18px] leading-[28px] mb-1 text-gray-900">
                    Enable Your Camera
                  </h3>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Grant webcam access to start your magical journey. We use your camera to track your hand movements.
                  </p>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-6 relative">
                <div className="w-[56px] h-[56px] rounded-full bg-[#d95763] flex items-center justify-center text-white text-[40px] leading-[36px] flex-shrink-0">
                  2
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-[18px] leading-[28px] mb-1 text-gray-900">
                    Draw a Gesture
                  </h3>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Draw the shape of a spell (circle, wave, spiral, etc.) in front of your webcam to cast magic.
                  </p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-6 relative">
                <div className="w-[56px] h-[56px] rounded-full bg-[#d95763] flex items-center justify-center text-white text-[40px] leading-[36px] flex-shrink-0">
                  3
                </div>
                <div className="flex-1 pt-2">
                  <h3 className="text-[18px] leading-[28px] mb-1 text-gray-900">
                    Cast Your Spell
                  </h3>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    See your spell come to life in the game and defeat enemies with your gestures!
                  </p>
                </div>
              </div>
            </div>

            {/* Training Mode Card */}
            <div className="bg-[rgba(43,127,255,0.15)] p-8 rounded-[15px]">
              <h3 
                className="text-[24px] leading-[28px] mb-4 text-gray-900"
                style={{ fontFamily: "'Pixelify Sans', sans-serif" }}
              >
                Training Mode
              </h3>
              <p className="text-[16px] leading-[20px] text-[#4a5565] mb-6">
                Practice your gestures before heading into battle. Learn to:
              </p>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-[16px] leading-[20px] text-[#4a5565]">
                  <span className="text-[#7c3aed]">•</span>
                  Draw precise spell patterns
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-[20px] text-[#4a5565]">
                  <span className="text-[#7c3aed]">•</span>
                  Time your gestures perfectly
                </li>
                <li className="flex items-center gap-2 text-[16px] leading-[20px] text-[#4a5565]">
                  <span className="text-[#7c3aed]">•</span>
                  Master advanced combinations
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What if we went further Section */}
      <section 
        className="relative py-20 px-6"
        
      >
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-[64px] leading-[36px] mb-4 text-[#ff8a65]"
              style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
            >
              What if we went further?
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-[39px] gap-y-[53px] max-w-[1392px] mx-auto">
            {/* Feature Card 1 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  ONLINE
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Multiplayer Mode
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Challenge other mages around the world in real-time gesture battles. Use your skills against human opponents.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  SEASONAL
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Events & Campaigns
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Participate in limited-time events, seasonal challenges, and epic story campaigns with exclusive rewards.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  ADVANCED
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Combo System
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Chain multiple gestures together to create devastating combo attacks and unlock powerful spell combinations.
              </p>
            </div>

            {/* Feature Card 4 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  LEVEL UP
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Progressive System
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Level up your mage, unlock new spells, abilities, and customize your character's appearance and skills.
              </p>
            </div>

            {/* Feature Card 5 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  PREMIUM
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Immersive Soundtrack
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Experience an epic orchestral soundtrack that adapts to your actions and enhances every magical moment.
              </p>
            </div>

            {/* Feature Card 6 */}
            <div className="bg-white rounded-[10px] p-6 relative">
              <div className="absolute top-6 right-6">
                <span className="inline-block px-3 py-1 bg-[#7171ea] text-white text-[12px] leading-[16px] rounded-full">
                  TEAMWORK
                </span>
              </div>
              <h3 
                className="text-[18px] leading-[28px] mb-2 text-gray-900 mt-8"
                style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
              >
                Cooperation Mode
              </h3>
              <p className="text-[20px] leading-[22.75px] text-[#4a5565]">
                Team up with friends to tackle challenging dungeons and bosses. Coordinate your gestures for team attacks.
              </p>
            </div>
          </div>

         {/* Mockup/Video Section */}
          <div className="mt-22 max-w-6xl mx-auto">
            <div className="p-8 rounded-[15px]">
              <h3 
                className="text-[64px] leading-[36px] mb-12 text-cente text-black text-center pixel-font"
                
              >
                Mockups & Visual Concepts
              </h3>
              
              <div className="grid md:grid-cols-2 gap-[39px]">
                <div className="bg-white rounded-[10px] p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-feu.svg" alt="Interface" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 
                    className="text-[18px] leading-[28px] mb-2 text-gray-900"
                    style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                  >
                    Enhanced Interface
                  </h4>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Minimalist HUD with mana bar, combo counter and mini-map
                  </p>
                </div>

                <div className="bg-white rounded-[10px] p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-glace.svg" alt="Environnements" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 
                    className="text-[18px] leading-[28px] mb-2 text-gray-900"
                    style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                  >
                    3D Environments
                  </h4>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Levels with depth and parallax for total immersion
                  </p>
                </div>

                <div className="bg-white rounded-[10px] p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-foudre.svg" alt="Particles" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 
                    className="text-[18px] leading-[28px] mb-2 text-gray-900"
                    style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                  >
                    Particle Effects
                  </h4>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Advanced particle systems for spectacular spells
                  </p>
                </div>

                <div className="bg-white rounded-[10px] p-6">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/MC-pose-neutral-1.svg" alt="Characters" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 
                    className="text-[18px] leading-[28px] mb-2 text-gray-900"
                    style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
                  >
                    Animated Characters
                  </h4>
                  <p className="text-[14px] leading-[20px] text-[#4a5565]">
                    Detailed sprites with fluid combat animations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
       {/* Tech Stack Section */}
      <section className="py-20 px-6 bg-black relative">
        <div className="absolute inset-0 backdrop-blur-[2px] bg-[rgba(0,0,0,0.04)]"></div>
        <div className="container mx-auto relative z-10 text-center">
          <h2 
            className="text-[64px] leading-[36px] text-center mb-16 text-white"
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
          >
            Technologies Used
          </h2>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Next.js' },
              { name: 'p5.js' },
              { name: 'ml5.js' },
              { name: 'JavaScript' },
              { name: 'TailwindCSS' },
            ].map((tech) => (
              <div key={tech.name} className="bg-white px-6 py-4 rounded-lg border border-gray-200 transition-all">
                <div className="font-semibold text-lg text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section 
        className="relative py-20 px-6"
        style={{
          backgroundImage: `url(/pixelatedBackground.svg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="container mx-auto text-center">
          <h2 
            className="text-[64px] leading-[36px] mb-6 text-[#ff8a65]"
            style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }}
          >
            Ready to Become a Mage?
          </h2>
          <p className="text-[20px] leading-[22.75px] text-[#4a5565] mb-8 max-w-2xl mx-auto">
            Launch the game now and master the art of magical gestures
          </p>
          <Link 
            href="/game" 
            className="inline-block px-12 py-4 bg-[#7171ea] hover:bg-[#5a5ad4] text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105"
          >
            Play Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ fontFamily: "'Pixelify Sans', sans-serif", fontWeight: 'normal' }} className="py-8 px-6 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>© 2026 Gesture RPG - Student Project NuitMMI</p>
          <p className="text-sm mt-2">Powered by Next.js, p5.js and ml5.js</p>
        </div>
      </footer>

      {/* Load Pixelify Sans font */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link 
        href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@400;500;600;700&display=swap" 
        rel="stylesheet" 
      />
    </div>
  );
}