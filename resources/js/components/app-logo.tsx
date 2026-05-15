export default function AppLogo() {
    return (
        <>
            <div className="flex aspect-square size-9 items-center justify-center overflow-hidden rounded-md bg-[#040404]">
                <img
                    src="/image.png"
                    alt="Lauan Restaurant"
                    className="size-full object-cover"
                />
            </div>
            <div className="ml-1 grid flex-1 text-left text-sm">
                <span className="mb-0.5 truncate leading-tight font-semibold">
                    Lauan Restaurant
                </span>
            </div>
        </>
    );
}
