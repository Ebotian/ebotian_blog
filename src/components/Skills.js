import React from "react";
import Card from "./Card";
import {
	Code,
	Terminal,
	FileText,
	Monitor,
	Cpu,
	Atom,
	Server,
	Layers,
	Activity,
} from "lucide-react";
import {
	SiPython,
	SiC,
	SiDocker,
	SiNodedotjs,
	SiMongodb,
	SiReact,
	SiHtml5,
	SiJavascript,
	SiGit,
	SiArduino,
	SiStmicroelectronics,
	SiEspressif,
} from "react-icons/si";

const ICON_MAP = {
	// brand logos (use react-icons simple icons where available)
	python: SiPython,
	c: SiC,
	javascript: SiJavascript,
	html: SiHtml5,
	react: SiReact,
	node: SiNodedotjs,
	mongodb: SiMongodb,
	docker: SiDocker,
	git: SiGit,
	matlab: Monitor,
	arduino: SiArduino,
	stm32: SiStmicroelectronics,
	esp32: SiEspressif,
	office: FileText,

	// generic icons (lucide)
	shell: Terminal,
	latex: FileText,
	markdown: FileText,
	verilog: Cpu,
	vue: Atom,
	vite: Atom,
	flask: Server,
	pcb: Layers,
	nginx: Server,
	linux: Terminal,
	algorithms: Activity,
};

// Ordered skills: programming first, hardware, frontend, backend/fullstack, engineering tools, algorithms, office last
const defaultSkills = [
	{ key: "python", name: "Python", icon: "python" },
	{ key: "c", name: "C", icon: "c" },
	{ key: "shell", name: "Shell", icon: "shell" },

	{ key: "javascript", name: "JavaScript", icon: "javascript" },
	{ key: "html", name: "HTML5 / CSS3", icon: "html" },
	{ key: "matlab", name: "Matlab / Simulink", icon: "matlab" },
	{ key: "verilog", name: "Verilog", icon: "verilog" },

	{ key: "react", name: "React", icon: "react" },
	{ key: "vue", name: "Vue", icon: "vue" },

	{ key: "node", name: "Node.js / Express", icon: "node" },
	{ key: "flask", name: "Python Flask", icon: "flask" },
	{ key: "mongodb", name: "MongoDB / MySQL", icon: "mongodb" },

	{ key: "esp32", name: "ESP32", icon: "esp32" },
	{ key: "arduino", name: "Arduino", icon: "arduino" },
	{ key: "stm32", name: "STM32", icon: "stm32" },
	{ key: "pcb", name: "PCB Layout / Multisim", icon: "pcb" },

	{ key: "git", name: "Git / GitHub", icon: "git" },
	{ key: "docker", name: "Docker", icon: "docker" },
	{ key: "nginx", name: "Nginx", icon: "nginx" },
	{ key: "linux", name: "Linux", icon: "linux" },
	{ key: "algorithms", name: "Algorithm", icon: "algorithms" },

	{ key: "latex", name: "LaTeX", icon: "latex" },
	{ key: "markdown", name: "Markdown", icon: "markdown" },
	{ key: "office", name: "WPS / Office", icon: "office" },
];

export default function Skills({ skills = defaultSkills }) {
	return (
		<section className="w-full mb-6" aria-label="技能槽">
			<div className="max-w-2xl mx-auto">
				<Card>
					<div className="mb-3 text-sm font-mono">我学会的一些东西:</div>
					<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
						{skills.map((s) => {
							const IconComp = ICON_MAP[s.icon] || Code;
							return (
								<div
									key={s.key}
									className="flex flex-col items-center text-center text-xs"
								>
									<div
										className="w-14 h-14 rounded-full flex items-center justify-center transition-transform transform hover:scale-105"
										aria-hidden
										style={{ backgroundColor: "rgba(17,24,39,0.04)" }}
									>
										<IconComp
											className="w-7 h-7"
											style={{ color: "var(--card-text)" }}
										/>
									</div>
									<div
										className="mt-2 leading-tight text-xs"
										style={{ color: "var(--card-text)" }}
									>
										{s.name}
									</div>
								</div>
							);
						})}
					</div>
				</Card>
			</div>
		</section>
	);
}
