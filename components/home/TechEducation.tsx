import React from 'react'

const education = [
    {
        school: 'University of Southern California',
        degree: 'M.S. Computer Science',
        year: '2018',
        location: 'Los Angeles, CA',
    },
    {
        school: 'Beijing University of Posts and Telecommunications',
        degree: 'B.E. Internet of Things',
        year: '2016',
        location: 'Beijing, China',
    },
]

export const TechEducation = () => {
    return (
        <section>
            <div className="flex items-center gap-2 mb-6 text-lg font-mono text-green-500">
                <span>$</span>
                <span className="text-foreground">cat education.json</span>
            </div>

            <div className="grid gap-6">
                {education.map((edu) => (
                    <div key={edu.school} className="bg-card border border-border p-6 rounded-lg hover:border-green-500/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                            <h3 className="font-bold text-foreground">{edu.school}</h3>
                            <span className="text-sm font-mono text-blue-400">{edu.year}</span>
                        </div>
                        <div className="text-muted-foreground">{edu.degree}</div>
                    </div>
                ))}
            </div>
        </section>
    )
}
