interface Props {

    onCancel: () => void;

    onPublish: () => void;

}

export default function ShareFooter({

    onCancel,

    onPublish

}: Props) {

    return (

        <div className="flex justify-end gap-4 pt-6">

            <button
                onClick={onCancel}
                className="rounded-xl border px-5 py-3"
            >
                Cancel
            </button>

            <button
                onClick={onPublish}
                className="rounded-xl bg-primary text-white px-6 py-3"
            >
                Publish
            </button>

        </div>

    );

}