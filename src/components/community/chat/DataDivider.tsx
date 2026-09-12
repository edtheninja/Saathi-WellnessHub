interface Props {
    label:string;
}

export default function DateDivider({label}:Props){

    return(

        <div className="flex items-center gap-4 my-8">

            <div className="flex-1 h-px bg-border"/>

            <span className="text-xs text-muted-foreground">
                {label}
            </span>

            <div className="flex-1 h-px bg-border"/>

        </div>

    );

}