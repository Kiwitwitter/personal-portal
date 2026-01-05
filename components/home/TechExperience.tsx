import React from 'react'

const experience = [
    {
        company: 'Adobe',
        role: 'Backend SDE',
        period: '2023 - Present',
        hash: '7a8b9c',
        msg: 'feat: Unified API platform & AI agents',
        details: [
            'Scale: 100+ microservices aggregation',
            'Tech: Context retrieval for AI agents (MCP)',
            'Optim: Dual-pipeline isolation architecture'
        ]
    },
    {
        company: 'Meta',
        role: 'Backend SDE',
        period: '2022 - 2023',
        hash: '3e4f5a',
        msg: 'feat: Global ML infrastructure',
        details: [
            'Scale: Global fleet management',
            'Tech: C++/Rust core services',
            'Optim: Custom accelerator lifecycle'
        ]
    },
    {
        company: 'Amazon',
        role: 'Backend SDE',
        period: '2019 - 2022',
        hash: '1b2c3d',
        msg: 'perf: DRM service optimization',
        details: [
            'Scale: 80K-140K TPS',
            'Tech: FairPlay DRM',
            'Optim: P95 latency 130ms -> 35ms'
        ]
    },
]

export const TechExperience = () => {
    return (
        <section className="mb-20">
            <div className="flex items-center gap-2 mb-8 text-lg font-mono text-green-500">
                <span>$</span>
                <span className="text-foreground">git log --oneline --graph</span>
            </div>

            <div className="relative pl-4 space-y-12">
                {experience.map((job, index) => (
                    <div key={job.company} className="relative pl-8 border-l-2 border-border last:border-0 pb-12 last:pb-0">
                        {/* Git graph node */}
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-card border-2 border-blue-500" />

                        <div className="font-mono">
                            <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4 mb-2">
                                <span className="text-yellow-500 text-sm">{job.hash}</span>
                                <h3 className="text-lg font-bold text-foreground">
                                    {job.company} <span className="text-muted-foreground font-normal">/ {job.role}</span>
                                </h3>
                                <span className="text-xs text-muted-foreground ml-auto">{job.period}</span>
                            </div>

                            <div className="mb-3 text-muted-foreground">
                                <span className="text-blue-400">commit message:</span> {job.msg}
                            </div>

                            <div className="bg-muted/30 p-4 rounded border border-border/50 text-sm grid gap-2">
                                {job.details.map((detail, i) => (
                                    <div key={i} className="flex gap-2">
                                        <span className="text-green-500/50">+</span>
                                        <span className="text-muted-foreground">{detail}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}
