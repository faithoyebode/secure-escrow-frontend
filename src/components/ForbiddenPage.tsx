import { Button } from "@/components/ui/button";


const ForbiddenPage = ({message} : {message: string}) => {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
        <p className="mb-6">{message}</p>
        <Button asChild>
          <a href="/login">Log In</a>
        </Button>
      </div>
    );
}

export default ForbiddenPage