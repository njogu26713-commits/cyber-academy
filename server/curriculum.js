export const curriculum = [
  {
    id: 'module-1',
    title: 'Cybersecurity Fundamentals',
    icon: '🛡️',
    level: 'Beginner',
    lessons: [
      {
        id: 'lesson-1-1',
        title: 'What is Cybersecurity?',
        description: 'Introduction to cybersecurity, why it matters, and the threat landscape.',
        topics: ['Definition of cybersecurity', 'Why cybersecurity matters', 'Types of cyber threats', 'Real-world impact of breaches'],
      },
      {
        id: 'lesson-1-2',
        title: 'The CIA Triad',
        description: 'Confidentiality, Integrity, and Availability — the three pillars of information security.',
        topics: ['Confidentiality', 'Integrity', 'Availability', 'Real-world examples of each'],
      },
      {
        id: 'lesson-1-3',
        title: 'Types of Attackers & Motives',
        description: 'Understanding who the adversaries are and what drives them.',
        topics: ['Script kiddies', 'Hacktivists', 'Cybercriminals', 'Nation-state actors', 'Insider threats'],
      },
      {
        id: 'lesson-1-4',
        title: 'Security Mindset & Defense in Depth',
        description: 'How to think like a security professional and build layered defenses.',
        topics: ['Attacker vs defender mindset', 'Defense in depth', 'Principle of least privilege', 'Security policies'],
      },
    ],
  },
  {
    id: 'module-2',
    title: 'Linux for Security',
    icon: '🐧',
    level: 'Beginner',
    lessons: [
      {
        id: 'lesson-2-1',
        title: 'Linux Basics',
        description: 'Essential Linux commands every security professional must know.',
        topics: ['File system navigation', 'Creating/editing files', 'User management', 'Process management'],
      },
      {
        id: 'lesson-2-2',
        title: 'File Permissions & Ownership',
        description: 'Understanding and securing Linux file permissions.',
        topics: ['chmod, chown, chgrp', 'SUID, SGID, Sticky bit', 'Access control lists', 'umask'],
      },
      {
        id: 'lesson-2-3',
        title: 'Networking Commands',
        description: 'Linux commands for network reconnaissance and monitoring.',
        topics: ['ifconfig/ip', 'netstat/ss', 'nmap basics', 'tcpdump', 'curl & wget'],
      },
      {
        id: 'lesson-2-4',
        title: 'Bash Scripting for Security',
        description: 'Automate security tasks with Bash scripting.',
        topics: ['Variables & loops', 'Conditionals', 'Functions', 'Writing recon scripts'],
      },
    ],
  },
  {
    id: 'module-3',
    title: 'Networking Fundamentals',
    icon: '🌐',
    level: 'Beginner',
    lessons: [
      {
        id: 'lesson-3-1',
        title: 'OSI Model',
        description: 'The 7-layer model that defines how data travels across networks.',
        topics: ['All 7 layers explained', 'What happens at each layer', 'Common attacks per layer'],
      },
      {
        id: 'lesson-3-2',
        title: 'TCP/IP & Protocols',
        description: 'The protocols that power the internet and how attackers exploit them.',
        topics: ['TCP vs UDP', 'IP addressing & subnetting', 'Common protocols (HTTP, DNS, DHCP, ARP)'],
      },
      {
        id: 'lesson-3-3',
        title: 'Firewalls & IDS/IPS',
        description: 'Network security controls that block and detect threats.',
        topics: ['Packet filtering', 'Stateful inspection', 'IDS vs IPS', 'Common firewall rules'],
      },
      {
        id: 'lesson-3-4',
        title: 'Network Scanning & Enumeration',
        description: 'How attackers discover targets and how defenders detect them.',
        topics: ['Port scanning concepts', 'Service enumeration', 'Banner grabbing', 'Passive vs active recon'],
      },
    ],
  },
  {
    id: 'module-4',
    title: 'Web Security',
    icon: '🕸️',
    level: 'Intermediate',
    lessons: [
      {
        id: 'lesson-4-1',
        title: 'HTTP/HTTPS Deep Dive',
        description: 'How the web works and where security vulnerabilities live.',
        topics: ['HTTP methods & status codes', 'Headers & cookies', 'HTTPS & TLS', 'Same-origin policy'],
      },
      {
        id: 'lesson-4-2',
        title: 'OWASP Top 10',
        description: 'The most critical web application security risks.',
        topics: ['Injection flaws', 'Broken authentication', 'Sensitive data exposure', 'Security misconfigurations'],
      },
      {
        id: 'lesson-4-3',
        title: 'SQL Injection',
        description: 'One of the most common and dangerous web vulnerabilities.',
        topics: ['How SQLi works', 'Types of SQL injection', 'Union-based & blind SQLi', 'Prevention techniques'],
      },
      {
        id: 'lesson-4-4',
        title: 'XSS, CSRF & Other Attacks',
        description: 'Client-side attacks that target web users.',
        topics: ['Reflected, Stored & DOM XSS', 'CSRF attacks', 'Clickjacking', 'Content Security Policy'],
      },
    ],
  },
  {
    id: 'module-5',
    title: 'Ethical Hacking',
    icon: '💻',
    level: 'Intermediate',
    lessons: [
      {
        id: 'lesson-5-1',
        title: 'Penetration Testing Basics',
        description: 'The methodology, ethics, and legal framework of pen testing.',
        topics: ['Pen testing phases', 'Rules of engagement', 'Legal considerations', 'Bug bounty programs'],
      },
      {
        id: 'lesson-5-2',
        title: 'Reconnaissance Techniques',
        description: 'Gathering intelligence on targets before an attack.',
        topics: ['OSINT techniques', 'Google dorking', 'Whois & DNS enumeration', 'Social engineering recon'],
      },
      {
        id: 'lesson-5-3',
        title: 'Exploitation Fundamentals',
        description: 'Understanding how vulnerabilities are exploited.',
        topics: ['Buffer overflows concept', 'Metasploit basics', 'Common exploit types', 'CVEs and public exploits'],
      },
      {
        id: 'lesson-5-4',
        title: 'Post-Exploitation & Reporting',
        description: 'What happens after initial access and how to document findings.',
        topics: ['Privilege escalation', 'Lateral movement concepts', 'Data exfiltration', 'Writing pentest reports'],
      },
    ],
  },
  {
    id: 'module-6',
    title: 'Cryptography',
    icon: '🔐',
    level: 'Intermediate',
    lessons: [
      {
        id: 'lesson-6-1',
        title: 'Encryption Fundamentals',
        description: 'How encryption protects data at rest and in transit.',
        topics: ['What is encryption?', 'Symmetric encryption', 'Key exchange problem', 'Common use cases'],
      },
      {
        id: 'lesson-6-2',
        title: 'Asymmetric Cryptography',
        description: 'Public key infrastructure and how it secures the internet.',
        topics: ['RSA algorithm', 'Elliptic curve cryptography', 'Digital signatures', 'Key management'],
      },
      {
        id: 'lesson-6-3',
        title: 'Hashing & Integrity',
        description: 'One-way functions and how they ensure data integrity.',
        topics: ['MD5, SHA family', 'Password hashing (bcrypt, Argon2)', 'Hash collisions', 'HMAC'],
      },
      {
        id: 'lesson-6-4',
        title: 'PKI & TLS/SSL',
        description: 'Certificate authorities and how HTTPS works under the hood.',
        topics: ['X.509 certificates', 'Certificate chains', 'TLS handshake', 'Common SSL/TLS attacks'],
      },
    ],
  },
  {
    id: 'module-7',
    title: 'Incident Response',
    icon: '🚨',
    level: 'Advanced',
    lessons: [
      {
        id: 'lesson-7-1',
        title: 'IR Lifecycle',
        description: 'The phases of responding to a security incident.',
        topics: ['Preparation', 'Detection & Analysis', 'Containment', 'Eradication & Recovery', 'Post-incident'],
      },
      {
        id: 'lesson-7-2',
        title: 'Digital Forensics Basics',
        description: 'Collecting and preserving evidence from compromised systems.',
        topics: ['Chain of custody', 'Disk imaging', 'Memory forensics', 'Log analysis', 'Timeline reconstruction'],
      },
      {
        id: 'lesson-7-3',
        title: 'Malware Analysis',
        description: 'Understanding how malware works and how to analyze it.',
        topics: ['Types of malware', 'Static analysis', 'Dynamic analysis', 'Sandbox environments'],
      },
      {
        id: 'lesson-7-4',
        title: 'Threat Intelligence',
        description: 'Using intelligence to stay ahead of attackers.',
        topics: ['IOCs & TTPs', 'MITRE ATT&CK framework', 'Threat feeds', 'Threat hunting basics'],
      },
    ],
  },
  {
    id: 'module-8',
    title: 'Advanced Topics',
    icon: '⚡',
    level: 'Advanced',
    lessons: [
      {
        id: 'lesson-8-1',
        title: 'CTF Strategy & Practice',
        description: 'How to approach Capture the Flag competitions.',
        topics: ['CTF categories', 'Web challenges', 'Reverse engineering', 'Crypto challenges', 'Forensics'],
      },
      {
        id: 'lesson-8-2',
        title: 'Cloud Security',
        description: 'Security challenges and best practices in cloud environments.',
        topics: ['AWS/Azure/GCP security', 'IAM misconfigurations', 'Container security', 'Serverless security'],
      },
      {
        id: 'lesson-8-3',
        title: 'Social Engineering',
        description: 'The human element of cybersecurity — the biggest vulnerability.',
        topics: ['Phishing techniques', 'Pretexting & vishing', 'Physical security', 'Security awareness training'],
      },
      {
        id: 'lesson-8-4',
        title: 'Certifications & Career Paths',
        description: 'Your roadmap to a cybersecurity career.',
        topics: ['CompTIA Security+, CEH, OSCP', 'Blue team vs red team', 'Building a home lab', 'Portfolio advice'],
      },
    ],
  },
];

export function getLessonById(lessonId) {
  for (const module of curriculum) {
    const lesson = module.lessons.find(l => l.id === lessonId);
    if (lesson) return { ...lesson, moduleTitle: module.title, moduleLevel: module.level };
  }
  return null;
}
