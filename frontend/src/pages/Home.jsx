import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  return (
    <>
    <Navbar />
    <div className="bg-gray-50 text-gray-800">
      {/* ================= HERO SECTION ================= */}
      <section className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-blue-700 mb-6">
              Panic attack frequency detection
            </h1>
            <p className="text-lg text-gray-600 mb-6">
              A clinically inspired digital platform designed to evaluate
              panic-related symptoms and provide early risk insights.
            </p>

            <Link
              to="/register"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
            >
              Start Assessment
            </Link>
          </div>

          <div>
            <img
              src="https://cdn-icons-png.flaticon.com/512/3774/3774299.png"
              alt="Medical Illustration"
              className="w-full max-w-md mx-auto"
            />
          </div>
        </div>
      </section>

      {/* ================= ABOUT PANIC ATTACK ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          What is a Panic Attack?
        </h2>
        <p className="text-gray-600 leading-relaxed">
          A panic attack is a sudden episode of intense fear or discomfort that
          triggers severe physical reactions when there is no real danger. It
          may include rapid heart rate, sweating, shortness of breath, and
          overwhelming anxiety. Panic attacks can occur unexpectedly or be
          triggered by stress, trauma, or health conditions.
        </p>
      </section>

      {/* ================= SYMPTOMS ================= */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-blue-700 mb-10 text-center">
            Common Symptoms
          </h2>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              "Rapid heartbeat or chest pain",
              "Shortness of breath",
              "Sweating and trembling",
              "Dizziness or fainting",
              "Fear of losing control",
              "Feeling detached from reality",
            ].map((symptom, index) => (
              <div
                key={index}
                className="bg-gray-50 border border-gray-200 p-6 rounded-xl shadow-sm"
              >
                <p className="text-gray-700">{symptom}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CAUSES ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          Causes & Risk Factors
        </h2>

        <ul className="space-y-3 text-gray-600 list-disc pl-6">
          <li>Family history of anxiety disorders</li>
          <li>Chronic stress or traumatic events</li>
          <li>Workplace pressure and burnout</li>
          <li>Lack of social support</li>
          <li>Substance use (caffeine, alcohol, smoking)</li>
        </ul>
      </section>

      {/* ================= PRECAUTIONS ================= */}
      <section className="bg-white py-16 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-blue-700 mb-6">
            Precautions & Prevention
          </h2>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold mb-2">Lifestyle Changes</h3>
              <p className="text-gray-600">
                Regular exercise, balanced diet, adequate sleep, and reducing
                caffeine intake can significantly lower panic risk.
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
              <h3 className="font-semibold mb-2">Stress Management</h3>
              <p className="text-gray-600">
                Practicing meditation, breathing exercises, and time management
                techniques can help prevent panic episodes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TREATMENT ================= */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-3xl font-semibold text-blue-700 mb-6">
          Treatment & Support
        </h2>
        <p className="text-gray-600 leading-relaxed">
          Panic disorders are treatable. Therapy (especially Cognitive
          Behavioral Therapy), medications when prescribed by professionals, and
          support groups have shown strong effectiveness in managing symptoms.
          Early assessment and intervention significantly improve outcomes.
        </p>
      </section>

      {/* ================= CTA ================= */}
      <section className="bg-blue-600 text-white py-16 text-center">
        <h2 className="text-3xl font-semibold mb-4">
          Take the First Step Toward Mental Wellness
        </h2>
        <p className="mb-6 text-blue-100">
          Use our AI-powered assessment tool to understand your mental health
          risk level.
        </p>

        <Link
          to="/register"
          className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition"
        >
          Start Assessment
        </Link>
      </section>

      {/* =============== FAQ ================= */}
      <section id="faq" className="bg-white py-16 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-semibold text-blue-700 mb-8 text-center">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                q: "Is this a medical diagnosis tool?",
                a: "No. This system provides risk assessment insights and should not replace professional medical consultation.",
              },
              {
                q: "Is my data secure?",
                a: "Yes. All assessments are securely stored and user authentication is protected using encrypted passwords and JWT tokens.",
              },
              {
                q: "Who should use this assessment?",
                a: "Anyone experiencing anxiety symptoms, work-related stress, or emotional distress.",
              },
            ].map((item, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-5"
              >
                <h3 className="font-semibold text-gray-800 mb-2">{item.q}</h3>
                <p className="text-gray-600">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================ Footer =============== */}
      <footer className="bg-gray-100 border-t border-gray-200 py-10">
        <div className="max-w-6xl mx-auto px-6 text-center text-gray-600">
          <p className="mb-2 font-medium text-gray-800">Emergency Support</p>

          <p>
            If you are experiencing a mental health crisis, please contact your
            local emergency services immediately.
          </p>

          <p className="mt-3">
            National Mental Health Helpline:
            <span className="text-blue-600 font-semibold"> 1800-121-3667</span>
          </p>

          <p className="mt-6 text-sm text-gray-500">
            © 2026 Mental Health AI System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>

  </>
  );
}
