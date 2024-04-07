import Typography from "@mui/material/Typography"

export default function Section2() {
    return (
        <div className="h-screen py-10">
            <div className="flex flex-col gap-10">
                <Typography className="text-white text-5xl text-center">
                    About us
                </Typography>
                <Typography className="text-white text-xl px-10">
                    Welcome to OptiRoute 360, your ultimate one-stop solution for efficient route planning and optimization. We understand that time is of the essence, and that's why we're here to streamline your travel experience, whether it's for work, leisure, or everyday errands.
                </Typography>
                <Typography className="text-white text-xl px-10">
                    At OptiRoute 360, we're on a mission to simplify the way you plan your journeys. Our innovative platform combines advanced algorithms with user-friendly interfaces to provide you with the most optimized routes possible. Our goal is to help you save time, reduce stress, and make the most out of every trip you take.
                </Typography>
            </div>
        </div>
    )
}