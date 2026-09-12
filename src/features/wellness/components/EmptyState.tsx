interface Props{
title:string;
description:string;
}

export default function EmptyState({
title,
description,
}:Props){

return(

<div className="text-center py-12">

<h3 className="font-semibold text-xl">

{title}

</h3>

<p className="mt-3 text-muted-foreground">

{description}

</p>

</div>

);

}