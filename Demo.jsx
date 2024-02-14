import React from 'react';
import { useState, useEffect } from 'react';
import { copy, linkIcon, loader, tick } from '../assets';
import { useLazyGetSummaryQuery } from '../services/article';

const Demo = () => {
  // State for the currently selected article and its summary
  const [article, setArticle] = useState({
    url: '',
    summary: '',
  });

  // State to store all articles fetched and displayed
  const [allArticles, setAllArticles] = useState([]);

  // State to manage the "copied" status for the copy button
  const [copied, setCopied] = useState('');

  // Query hook for fetching article summaries
  const [getSummary, { error, isFetching }] = useLazyGetSummaryQuery();

  // useEffect to load articles from local storage on component mount
  useEffect(() => {
    const articlesFromLocalStorage = JSON.parse(
      localStorage.getItem('articles')
    );
    if (articlesFromLocalStorage) {
      setAllArticles(articlesFromLocalStorage);
    }
  }, []);

  // Function to handle form submission and fetch article summary
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Fetch article summary using the query hook
    const { data } = await getSummary({ articleUrl: article.url });

    if (data?.summary) {
      // Update the state with the new article and summary
      const newArticle = { ...article, summary: data.summary };
      const updatedAllArticles = [newArticle, ...allArticles];

      setArticle(newArticle);
      setAllArticles(updatedAllArticles);

      // Update local storage with the updated list of articles
      localStorage.setItem('articles', JSON.stringify(updatedAllArticles));
    }
  };

  // Function to handle copying article URL to clipboard
  const handleCopy = (copyUrl) => {
    // Set the "copied" state to show feedback to the user
    setCopied(copyUrl);
    navigator.clipboard.writeText(copyUrl);
    // Clear the "copied" state after a delay
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <section className="mt-16 w-full max-w-xl">
      {/* Search */}
      <div className="flex flex-col w-full gap-2">
        <form
          className="relative flex justify-center items-center"
          onSubmit={handleSubmit}
        >
          {/* Input field for entering the URL */}
          <img
            src={linkIcon}
            alt="link_icon"
            className="absolute left-0 my-2 ml-3 w-5"
          />
          <input
            type="url"
            placeholder="Enter a URL"
            value={article.url}
            onChange={(e) =>
              setArticle({ ...article, url: e.target.value })
            }
            required
            className="url_input peer"
          />
          {/* Button to submit the form */}
          <button
            type="submit"
            className="submit_btn peer-focus:border-gray-700 peer-focus:text-gray-700"
          >
            Enter
          </button>
        </form>

        {/* Browser URL History */}
        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto">
          {/* Display the list of all articles */}
          {allArticles.map((item, index) => (
            <div
              key={`link-${index}`}
              onClick={() => setArticle(item)}
              className="link_card"
            >
              {/* Button to copy article URL */}
              <div
                className="copy_btn"
                onClick={() => handleCopy(item.url)}
              >
                <img
                  src={copied === item.url ? tick : copy}
                  alt="copy_icon"
                  className="w-[40%] h-[40%] object-contain"
                />
              </div>
              {/* Display the article URL */}
              <p className="flex-1 font-satoshi text-blue-700 font-medium text-small truncate">
                {item.url}
              </p>
            </div>
          ))}
        </div>
      </div>
      {/* Display Results */}
      <div className="my-10 max-w-full flex justify-center items-center">
        {/* Display loader, error message, or article summary based on the state */}
        {isFetching ? (
          <img
            src={loader}
            alt="loader"
            className="w-20 h-20 object-contain"
          />
        ) : error ? (
          <p className="font-inter font bold text-black text-center">
            Well, that wasn't supposed to happen...
            <br />
            <span className="font-satoshi font-normal text-gray-700">
              {error?.data?.error}
            </span>
          </p>
        ) : (
          article.summary && (
            <div className="flex flex-col gap-3">
              {/* Display article summary */}
              <h2 className="font-satoshi font-bold text-gray-700 text-xl">
                Article <span className="orange_gradient">Summary</span>
              </h2>
              <div className="summary-box">
                <p className="font-inter font-medium text-sm text-black">
                  {article.summary}
                </p>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
};

export default Demo;
