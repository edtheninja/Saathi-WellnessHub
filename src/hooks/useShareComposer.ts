import { useState } from "react";
import { CommunityPost } from "@/types/communityPost";

export default function useShareComposer() {

    const [post, setPost] = useState<CommunityPost>({

        title: "",

        body: "",

        mood: "",

        type: "reflection",

        visibility: "community"

    });

    const update = (field: keyof CommunityPost, value: any) => {

        setPost(prev => ({
            ...prev,
            [field]: value
        }));

    };

    return {

        post,

        update

    };

}