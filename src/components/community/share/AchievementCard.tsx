interface Props {

    title: string;

    subtitle: string;

    icon: React.ReactNode;

}

export default function AchievementCard({

    title,

    subtitle,

    icon

}: Props) {

    return (

        <div className="rounded-3xl border p-5 flex gap-4 items-center">

            <div className="text-4xl">

                {icon}

            </div>

            <div>

                <h4 className="font-semibold">

                    {title}

                </h4>

                <p className="text-muted-foreground">

                    {subtitle}

                </p>

            </div>

        </div>

    );

}