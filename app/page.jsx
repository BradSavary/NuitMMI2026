import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-md">
        <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-[#E8D5C4] via-[#F5A962] via-[#E75A7C] to-[#9B59B6] bg-clip-text text-transparent">
            Gesture RPG
          </div>
          <Link 
            href="/game" 
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all transform hover:scale-105 shadow-md"
          >
            Play Now
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 bg-white">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-[#E8D5C4] via-[#F5A962] via-[#E75A7C] to-[#9B59B6] bg-clip-text text-transparent">
            Gesture RPG<br />Webcam Control
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8 max-w-3xl mx-auto">
            A revolutionary 2D RPG where your movements become magical spells
          </p>
          
          {/* Character Poses */}
          <div className="flex justify-center gap-8 mb-12 flex-wrap">
            <div className="relative w-32 h-32 transform hover:scale-110 transition-transform">
              <Image src="/svg/MC-pose-foudre.svg" alt="Lightning Pose" fill className="object-contain drop-shadow-2xl" />
            </div>
            <div className="relative w-32 h-32 transform hover:scale-110 transition-transform">
              <Image src="/svg/MC-pose-glace.svg" alt="Ice Pose" fill className="object-contain drop-shadow-2xl" />
            </div>
            <div className="relative w-32 h-32 transform hover:scale-110 transition-transform">
              <Image src="/svg/MC-pose-neutral-1.svg" alt="Neutral Pose" fill className="object-contain drop-shadow-2xl" />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/game" 
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg shadow-purple-200"
            >
              Start Adventure
            </Link>
            <a 
              href="#features" 
              className="px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Discover
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#F5A962] to-[#E75A7C] bg-clip-text text-transparent">A Unique Experience</h2>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="relative w-16 h-16 mb-4 mx-auto">
                <Image src="/svg/MC-pose-neutral-1.svg" alt="Gestes" fill className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Gesture Recognition</h3>
              <p className="text-gray-600">
                Draw shapes in the air with your hand to cast spells. Circles, lines, zigzags... each gesture invokes a different element!
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="flex gap-2 mb-4">
                <div className="relative w-12 h-12">
                  <Image src="/svg/element-feu.svg" alt="Feu" fill className="object-contain" />
                </div>
                <div className="relative w-12 h-12">
                  <Image src="/svg/element-glace.svg" alt="Glace" fill className="object-contain" />
                </div>
                <div className="relative w-12 h-12">
                  <Image src="/svg/element-foudre.svg" alt="Foudre" fill className="object-contain" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">5 Magic Elements</h3>
              <p className="text-gray-600">
                Fire, Ice, Earth, Electricity and Neutral. Each element has its strengths and weaknesses. Master them all!
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-8 rounded-2xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all hover:transform hover:scale-105">
              <div className="relative w-16 h-16 mb-4 mx-auto">
                <Image src="/svg/element-feu.svg" alt="Boss" fill className="object-contain" />
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Epic Bosses</h3>
              <p className="text-gray-600">
                Face bosses with complex attack patterns and multiple phases. Finish without taking damage for rewards!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Gameplay Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-16 bg-gradient-to-r from-[#E75A7C] to-[#9B59B6] bg-clip-text text-transparent">
            How to Play?
          </h2>
          
          <div className="grid md:grid-cols-2 gap-12 max-w-5xl mx-auto items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Enable Your Camera</h3>
                  <p className="text-gray-600">The game uses ml5.js to detect your hands in real-time</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Draw a Gesture</h3>
                  <p className="text-gray-600">Trace a shape in the air: circle, line, zigzag, spiral or V</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Validate with Space</h3>
                  <p className="text-gray-600">When the gesture is recognized, press SPACE to cast the spell</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 shadow-lg">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2 text-gray-900">Defeat Enemies</h3>
                  <p className="text-gray-600">Use the right elements against enemies and survive until the boss!</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl">
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Training Mode</h3>
              <p className="text-gray-600 mb-4">
                Not sure about your gestures? Use training mode to:
              </p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Calibrate your camera
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Test all gestures
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  See detection points
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Train on a dummy
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Version 2 Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-2 bg-purple-600 text-white font-bold rounded-full mb-4">
              FUTURE VISION
            </span>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-[#E8D5C4] via-[#F5A962] to-[#E75A7C] bg-clip-text text-transparent">
              What if we went further?
            </h2>
            <p className="text-xl text-gray-700 max-w-3xl mx-auto">
              Imagine Version 2.0 with even more immersive and innovative features
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Future Feature 1 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/MC-pose-neutral-2.svg" alt="Multi-Niveaux" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Multi-Level Story Mode</h3>
              <p className="text-gray-600 text-sm mb-4">
                10 tower floors with varied environments: temple, mystical forest, crystal cavern, flying castle...
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Cinematics between levels</li>
                <li>• Unique bosses per floor</li>
                <li>• Difficulty progression</li>
              </ul>
            </div>

            {/* Future Feature 2 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/MC-pose-glace.svg" alt="Assets" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Assets & Animations</h3>
              <p className="text-gray-600 text-sm mb-4">
                Polished pixel-art or anime style graphics, with fluid animations for spells and characters
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Animated GIF/WebP sprites</li>
                <li>• Advanced particle effects</li>
                <li>• Parallax backgrounds</li>
              </ul>
            </div>

            {/* Future Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/element-foudre.svg" alt="Combos" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Combo System</h3>
              <p className="text-gray-600 text-sm mb-4">
                Chain multiple gestures quickly to create devastating combos with damage multipliers
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Visual combo counter</li>
                <li>• Combined spells (fire + ice)</li>
                <li>• Style bonus</li>
              </ul>
            </div>

            {/* Future Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/element-glace.svg" alt="Progression" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Progression System</h3>
              <p className="text-gray-600 text-sm mb-4">
                Unlock new spells, upgrades and skills as you progress through the game
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Skill tree</li>
                <li>• Customizable spells</li>
                <li>• Achievements & badges</li>
              </ul>
            </div>

            {/* Future Feature 5 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/MC-pose-foudre.svg" alt="Son" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Immersive Soundtrack</h3>
              <p className="text-gray-600 text-sm mb-4">
                Dynamic music that adapts to combat, sound effects for each spell and ambiances per level
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Original OST per level</li>
                <li>• Spatialized 3D sounds</li>
                <li>• Rhythm mode for spells</li>
              </ul>
            </div>

            {/* Future Feature 6 */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-purple-600 text-white text-xs font-bold px-2 py-1 rounded">
                CONCEPT
              </div>
              <div className="relative w-12 h-12 mb-4 mx-auto">
                <Image src="/svg/element-feu.svg" alt="Coop" fill className="object-contain" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Cooperation Mode</h3>
              <p className="text-gray-600 text-sm mb-4">
                Play together with two webcams, coordinate your spells for devastating combined attacks
              </p>
              <ul className="text-sm text-gray-500 space-y-1">
                <li>• Fusion spells</li>
                <li>• Exclusive coop bosses</li>
                <li>• Duo leaderboard</li>
              </ul>
            </div>
          </div>

          {/* Mockup/Video Section */}
          <div className="mt-16 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-2xl">
              <h3 className="text-2xl font-bold mb-6 text-center text-gray-900">Mockups & Visual Concepts</h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-feu.svg" alt="Interface" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Enhanced Interface</h4>
                  <p className="text-sm text-gray-600">
                    Minimalist HUD with mana bar, combo counter and mini-map
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-glace.svg" alt="Environnements" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">3D Environments</h4>
                  <p className="text-sm text-gray-600">
                    Levels with depth and parallax for total immersion
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/element-foudre.svg" alt="Particles" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Particle Effects</h4>
                  <p className="text-sm text-gray-600">
                    Advanced particle systems for spectacular spells
                  </p>
                </div>

                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                    <div className="relative w-24 h-24">
                      <Image src="/svg/MC-pose-neutral-1.svg" alt="Characters" fill className="object-contain" />
                    </div>
                  </div>
                  <h4 className="font-bold mb-2 text-gray-900">Animated Characters</h4>
                  <p className="text-sm text-gray-600">
                    Detailed sprites with fluid combat animations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="py-20 px-6 bg-white">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 bg-gradient-to-r from-[#9B59B6] to-[#E75A7C] bg-clip-text text-transparent">Technologies Used</h2>
          
          <div className="flex flex-wrap justify-center gap-6 max-w-4xl mx-auto">
            {[
              { name: 'Next.js' },
              { name: 'p5.js' },
              { name: 'ml5.js' },
              { name: 'JavaScript ES6' },
              { name: 'TailwindCSS' },
            ].map((tech) => (
              <div key={tech.name} className="bg-white px-6 py-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-xl transition-all">
                <div className="font-semibold text-lg text-gray-900">{tech.name}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="container mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-[#E8D5C4] via-[#F5A962] via-[#E75A7C] to-[#9B59B6] bg-clip-text text-transparent">
            Ready to Become a Mage?
          </h2>
          <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
            Launch the game now and master the art of magical gestures
          </p>
          <Link 
            href="/game" 
            className="inline-block px-12 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xl transition-all transform hover:scale-105 shadow-xl shadow-purple-300"
          >
            Play Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 bg-gray-900 border-t border-gray-800">
        <div className="container mx-auto text-center text-gray-400">
          <p>© 2026 Gesture RPG - Student Project NuitMMI</p>
          <p className="text-sm mt-2">Powered by Next.js, p5.js and ml5.js</p>
        </div>
      </footer>
    </div>
  );
}
