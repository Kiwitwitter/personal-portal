import React from 'react'

const skills = {
    languages: ['Java', 'C++', 'Rust', 'Python', 'Node.js', 'SQL'],
    systems: ['Low-latency APIs', 'Real-time Pipelines', 'Event-driven', 'Multi-tenant'],
    cloud: ['AWS', 'Kubernetes', 'Docker', 'Kafka'],
    databases: ['MySQL', 'MongoDB', 'Aerospike', 'DynamoDB'],
}

export const TechSkills = () => {
    return (
        <section className="mb-20">
            <div className="flex items-center gap-2 mb-6 text-lg font-mono text-green-500">
                <span>$</span>
                <span className="text-foreground">cat skills.ts</span>
            </div>

            <div className="rounded-lg bg-[#1e1e1e] p-6 border border-border shadow-inner overflow-x-auto">
                <pre className="font-mono text-sm leading-relaxed">
                    <code>
                        <span className="text-blue-400">const</span> <span className="text-yellow-400">stack</span> <span className="text-muted-foreground">=</span> {'{'}
                        {'\n'}
                        {Object.entries(skills).map(([category, items]) => (
                            <React.Fragment key={category}>
                                {'  '}
                                <span className="text-blue-300">{category}</span>: [
                                {items.map((item, i) => (
                                    <React.Fragment key={item}>
                                        <span className="text-green-400">&apos;{item}&apos;</span>
                                        {i < items.length - 1 && <span className="text-muted-foreground">, </span>}
                                    </React.Fragment>
                                ))}
                                ],
                                {'\n'}
                            </React.Fragment>
                        ))}
                        {'}'}
                    </code>
                </pre>
            </div>
        </section>
    )
}
